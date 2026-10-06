import json
import re

from services.llm_client import chat_completion
from config import OLLAMA_MODEL


def extract_json_block(text: str) -> str:
    """Some free models wrap JSON in prose or code fences, or echo the prompt
    before answering. Pull out the outermost {...} or [...] instead of requiring
    the whole response to be valid JSON."""
    text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    candidates = [i for i in (text.find("{"), text.find("[")) if i != -1]
    if not candidates:
        return text
    start = min(candidates)
    closing = "}" if text[start] == "{" else "]"
    end = text.rfind(closing)
    if end == -1 or end < start:
        return text
    return text[start : end + 1]


def _repair_json(text: str) -> str:
    """Cheap, safe fixes for the mistakes a small local model tends to make: a
    trailing comma before a closing bracket, or curly quotes swapped in for
    straight ones. Applied only as a second try after a plain parse fails."""
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    text = text.replace("“", '"').replace("”", '"')
    return text


def parse_json_response(raw: str):
    """Try increasingly lenient parses of a model's JSON response. Returns None
    only if nothing salvageable is found, so callers can decide how to degrade."""
    candidate = extract_json_block(raw)
    for text in (candidate, _repair_json(candidate)):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            continue
    return None


def salvage_field(raw: str, field: str) -> str:
    """Last-resort recovery of one string field by regex when the JSON around it
    is broken — e.g. an unescaped quote inside another field derails the whole
    parse, but the field we actually need is still intact and readable."""
    match = re.search(rf'"{field}"\s*:\s*"((?:[^"\\]|\\.)*)"', raw, re.DOTALL)
    if not match:
        return ""
    return match.group(1).encode().decode("unicode_escape", errors="ignore").strip()


def strip_echoed_prompt(raw: str, *echoed_fragments: str) -> str:
    """Some free models repeat parts of the input verbatim before answering.
    Cut everything up through the last occurrence of each known input fragment."""
    for fragment in echoed_fragments:
        if not fragment:
            continue
        idx = raw.rfind(fragment)
        if idx != -1:
            raw = raw[idx + len(fragment) :]
    return raw.strip()


SYSTEM_PROMPT = (
    "You are a senior technical recruiter and ATS specialist who has screened thousands of CVs "
    "for competitive engineering roles. You are precise, evidence-driven, and never generic.\n\n"
    "Work through the analysis in this order before you answer:\n\n"
    "1. DECOMPOSE THE JOB. Break the job description into concrete, atomic requirements: hard "
    "skills and tools, years/seniority expectations, domain knowledge, scale or complexity "
    "signals, methodologies, and soft skills. Separate explicit must-haves from nice-to-haves; "
    "weight must-haves far more heavily.\n\n"
    "2. HUNT FOR EVIDENCE. For every requirement, search the CV for evidence. Evidence is a "
    "named tool, a shipped artifact, a measured outcome, a scope indicator (team size, traffic, "
    "data volume, budget), or a role that unambiguously implies the skill. A requirement is "
    "'covered' only when the CV shows it was actually practiced, 'partial' when it is adjacent "
    "or merely listed in a skills blob without supporting experience, and 'missing' when there "
    "is no credible trace. Quote the CV as evidence. Never invent experience the CV does not "
    "support, and never mark something covered just because a keyword appears in a skills list.\n\n"
    "3. SCORE CLARITY (0-100). Judge whether a busy recruiter can extract scope, action, and "
    "outcome from each bullet in a single pass. Penalise bullets that describe duties instead of "
    "results, bury the achievement at the end, stack three ideas into one sentence, or rely on "
    "unexplained internal jargon and acronyms.\n\n"
    "4. SCORE IMPACT VERBS (0-100). Assess the ratio of strong ownership verbs (built, led, "
    "shipped, designed, reduced, migrated, automated, negotiated) to weak passive phrasing "
    "(responsible for, worked on, helped with, assisted, involved in, participated in), and "
    "whether claims are quantified. Unquantified strong verbs still lose points.\n\n"
    "5. AUDIT FORMATTING for the things that actually break ATS parsers or recruiter trust: "
    "inconsistent or incomplete date ranges, missing contact channels, unparseable multi-column "
    "or table layouts, headers/footers holding key information, dense paragraphs where bullets "
    "belong, inconsistent tense or punctuation, and section headings an ATS will not recognise.\n\n"
    "6. JUDGE SENIORITY from demonstrated scope, not job titles — titles inflate across "
    "companies. Junior: roughly 0-2 years professional, executes well-scoped tasks, projects "
    "mostly academic or personal. Mid: roughly 2-6 years, owns features or services end to end "
    "and makes independent technical calls. Senior: roughly 6+ years or clear evidence of "
    "leading — owning architecture, driving cross-team outcomes, mentoring as a named duty, or "
    "accountability for scale, reliability, or budget. Internships and part-time study work "
    "count for less than full-time experience. When evidence sits between two levels, pick the "
    "lower one. Answer with exactly one of: Junior, Mid, Senior.\n\n"
    "7. REWRITE THE WEAKEST BULLETS. Pick the bullets whose improvement would most move this "
    "specific application forward. Each rewrite must quote the original verbatim, keep every "
    "claim truthful to the source, lead with a strong verb, surface the outcome, and fold in "
    "terminology this job description actually uses. Do not fabricate metrics: if the CV gives "
    "no number, restructure for clarity and impact instead of inventing one.\n\n"
    "Be demanding. A CV that merely lists the right technologies without evidence of applying "
    "them is a mediocre match, and your scores should say so.\n\n"
    "Return ONLY a JSON object matching the schema given. No preamble, no markdown fences, no "
    "extra text."
)

JSON_SCHEMA_HINT = (
    '{"clarity_score": int, "impact_verb_score": int, '
    '"seniority_level": "Junior" | "Mid" | "Senior", '
    '"requirement_matches": [{"requirement": string, "status": "covered" | "partial" | "missing", '
    '"evidence": string, "importance": "must-have" | "nice-to-have"}], '
    '"missing_keywords": [string], '
    '"formatting_flags": [string], "rewrite_suggestions": '
    '[{"original": string, "improved": string, "reason": string}]}'
)

OUTPUT_INSTRUCTION = (
    "Depth requirements for this response:\n"
    "- requirement_matches: cover 8-14 of the most decision-relevant requirements from the job "
    "description, ordered must-haves first. 'evidence' must quote or closely paraphrase the "
    "specific CV line that justifies the status, or state plainly what is absent when missing.\n"
    "- missing_keywords: 5-12 concrete terms this job description uses that the CV never states, "
    "which the candidate could truthfully add if they have the experience. Exact terminology only "
    "(e.g. 'Kubernetes', 'CI/CD', 'incident response'), not sentences.\n"
    "- rewrite_suggestions: 4-6 rewrites, each targeting a different bullet.\n"
    "- formatting_flags: every entry must be a short, complete, human-readable sentence the "
    "candidate can act on directly, e.g. 'Missing a clickable email link in the header' or 'Some "
    "roles list only a start year instead of a full date range'. Never return a code, identifier, "
    "or snake_case token (e.g. NOT 'missing_email_link' or 'dates_incomplete')."
)


def score_cv(cv_text: str, job_description: str) -> dict:
    user_prompt = (
        f"CV TEXT:\n{cv_text}\n\nJOB DESCRIPTION:\n{job_description}\n\n"
        f"{OUTPUT_INSTRUCTION}\n\n"
        f"Return JSON matching this schema exactly:\n{JSON_SCHEMA_HINT}"
    )

    for attempt in range(2):
        response = chat_completion(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=3000,
            temperature=0.1,
        )
        raw = (response.choices[0].message.content or "").strip()
        parsed = parse_json_response(raw)
        if parsed is not None:
            return parsed
        if attempt == 1:
            return {
                "clarity_score": 50,
                "impact_verb_score": 50,
                "seniority_level": "Mid",
                "requirement_matches": [],
                "missing_keywords": [],
                "formatting_flags": ["Could not parse model output"],
                "rewrite_suggestions": [],
            }
