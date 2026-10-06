import json
import re

from services.llm_client import chat_completion
from services.llm_scorer import extract_json_block, parse_json_response, salvage_field
from config import OLLAMA_MODEL

QUESTIONS_SYSTEM_PROMPT = (
    "You are a senior hiring manager who runs the real technical loop for this role, not a "
    "generic question generator.\n\n"
    "Before writing anything, work out:\n"
    "- Which of this job's requirements the CV supports weakly or not at all. Those gaps are "
    "where a real interviewer would probe hardest.\n"
    "- Which claims on the CV are impressive but unverified — big numbers, senior-sounding "
    "scope, buzzword-heavy projects. A real interviewer pressure-tests those.\n"
    "- Which specific systems, projects, employers, and technologies the candidate actually "
    "names. Every question must reference at least one of them by name.\n\n"
    "Write questions a real interviewer would ask out loud: concrete, open-ended, and grounded "
    "in this candidate's actual history. Mix depth-of-experience questions, a scenario or "
    "trade-off question tied to this job's domain, and at least one that targets a genuine gap "
    "between the CV and the job description. Never ask generic filler ('What are your "
    "strengths?', 'Why do you want this job?', 'Tell me about yourself').\n\n"
    "Return ONLY a JSON array of strings, no preamble, no markdown fences."
)

FEEDBACK_SYSTEM_PROMPT = (
    "You are a demanding but fair senior interviewer debriefing on one answer.\n\n"
    "Grade against this rubric, in order:\n"
    "1. SUBSTANCE (weighs most). Did the answer actually explain the how — architecture, "
    "decisions, trade-offs, the candidate's personal role? Name-dropping technologies without "
    "explaining their use is near-worthless and must score low.\n"
    "2. STRUCTURE. Is there a clear situation, the actions the candidate personally took, and a "
    "result? Rambling or contextless answers lose points.\n"
    "3. EVIDENCE. Are there concrete specifics — scale, numbers, constraints, failure modes, "
    "what went wrong and what they changed?\n"
    "4. RELEVANCE. Does it speak to what this job description actually needs?\n"
    "5. COMMUNICATION. Would a busy panel follow it the first time? Note serious typos or "
    "fragments only if they genuinely impede understanding.\n\n"
    "Scoring guidance: 0-20 is a non-answer or a bare phrase; 21-40 names relevant concepts with "
    "no explanation; 41-60 explains something real but is thin on specifics or structure; 61-80 "
    "is a solid structured answer with concrete detail; 81-100 is what you would expect from a "
    "strong hire — specific, quantified, self-aware about trade-offs. Do not inflate scores.\n\n"
    "'improvements' must be actionable coaching the candidate can apply on their next attempt — "
    "name the missing element and what to say instead, not just what was wrong.\n\n"
    "Also write a model_answer: a strong example answer to the same question, in the candidate's "
    "voice (first person, STAR-style: situation, action, result), grounded in the specifics the "
    "question already mentions and tailored to the job description. Make it substantive enough to "
    "be a genuine template — cover the architecture or decisions involved, the candidate's "
    "personal role, a trade-off they weighed, and a measurable outcome. Write model_answer as "
    "plain prose with no markdown formatting at all (no **bold**, no headers, no bullet lists).\n\n"
    "Return ONLY a JSON object matching the schema given. No preamble, no markdown fences."
)

FEEDBACK_SCHEMA_HINT = (
    '{"score": int (0-100), "strengths": [string], "improvements": [string], "model_answer": string}'
)


def generate_interview_questions(cv_text: str, job_description: str, n: int = 5) -> list[str]:
    user_prompt = (
        f"CV TEXT:\n{cv_text}\n\nJOB DESCRIPTION:\n{job_description}\n\n"
        f"Write exactly {n} interview questions tailored to this candidate and role. Each "
        f"question must name a specific project, employer, or technology from this CV, and at "
        f"least one must probe a requirement in the job description that the CV does not clearly "
        f"evidence. Questions may be two sentences if the second one sharpens the focus.\n\n"
        f"Return a JSON array of exactly {n} strings."
    )
    response = chat_completion(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": QUESTIONS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=700,
        temperature=0.6,
    )
    raw = (response.choices[0].message.content or "").strip()
    raw = extract_json_block(raw)
    try:
        questions = json.loads(raw)
        return [str(q) for q in questions][:n]
    except json.JSONDecodeError:
        return [line.strip("-• ").strip() for line in raw.splitlines() if line.strip()][:n]


def score_interview_answer(question: str, answer: str, job_description: str) -> dict:
    user_prompt = (
        f"JOB DESCRIPTION:\n{job_description}\n\nQUESTION:\n{question}\n\n"
        f"CANDIDATE ANSWER:\n{answer}\n\n"
        f"Return JSON matching this schema exactly:\n{FEEDBACK_SCHEMA_HINT}"
    )
    last_raw = ""
    for attempt in range(3):
        response = chat_completion(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": FEEDBACK_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            # 1200 tokens was cutting off the model_answer paragraph mid-string on
            # longer STAR-style answers, leaving an unterminated JSON string that
            # failed to parse even though the model did everything else right.
            max_tokens=1700,
            temperature=0.3,
        )
        last_raw = (response.choices[0].message.content or "").strip()
        parsed = parse_json_response(last_raw)
        if parsed is not None:
            return parsed

    # Every attempt produced JSON broken enough that even the lenient repairs
    # couldn't fix it. Rather than hand back an empty "Could not parse model
    # output" dead end, pull whatever fields are still readable by regex —
    # a broken score/strengths list shouldn't cost the user the model_answer
    # they actually came here for.
    model_answer = salvage_field(last_raw, "model_answer")
    score = 50
    score_match = re.search(r'"score"\s*:\s*(\d{1,3})', last_raw)
    if score_match:
        score = max(0, min(100, int(score_match.group(1))))
    return {
        "score": score,
        "strengths": [],
        "improvements": [] if model_answer else ["Could not parse model output"],
        "model_answer": model_answer,
    }
