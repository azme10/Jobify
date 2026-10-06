import json

from services.llm_client import chat_completion
from services.llm_scorer import extract_json_block
from services.latex_cv_service import extract_cv_data, projects_block
from config import OLLAMA_MODEL

SYSTEM_PROMPT = (
    "You are an ATS keyword optimization expert. You are given a candidate's Projects section "
    "rendered as LaTeX (so each project's name, technologies, and bullet points are unambiguous) "
    "and a target job description.\n\n"
    "Method:\n"
    "1. Extract the concrete vocabulary this job description rewards: technologies, platforms, "
    "practices, architectural patterns, domain terms, and the phrasing used for scale or "
    "reliability.\n"
    "2. For each project, work out what it genuinely involved — including capabilities the "
    "candidate almost certainly exercised but never wrote down. Building a web API implies "
    "endpoint design and error handling; shipping anything implies some deployment and testing "
    "story.\n"
    "3. Suggest 3-6 keywords per project that (a) this job description actually values, (b) are "
    "absent from that project's current text, and (c) the project plausibly supports. Prefer the "
    "job description's exact terminology so an ATS matches it literally.\n"
    "4. Never suggest a keyword for a project it does not credibly apply to — a Go CLI tool "
    "should not be tagged with 'Kubernetes' just because the job mentions it. Relevance beats "
    "volume.\n\n"
    "'reason' must explain, in one or two sentences, the specific gap between what this project "
    "already says and what this job description is looking for — not a generic statement.\n\n"
    "Return ONLY JSON, no preamble, no markdown fences."
)

SCHEMA_HINT = '{"projects": [{"name": string, "suggested_keywords": [string], "reason": string}]}'


def suggest_project_keywords(cv_text: str, job_description: str) -> dict:
    data = extract_cv_data(cv_text, job_description)
    projects = data.get("projects") or []
    if not projects:
        return {"projects": []}

    projects_latex = projects_block(projects)
    user_prompt = (
        f"PROJECTS SECTION (LaTeX):\n{projects_latex}\n\nJOB DESCRIPTION:\n{job_description}\n\n"
        f"Return JSON matching this schema exactly:\n{SCHEMA_HINT}"
    )
    for attempt in range(2):
        response = chat_completion(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=1200,
            temperature=0.3,
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = extract_json_block(raw)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            if attempt == 1:
                return {"projects": []}
            continue
