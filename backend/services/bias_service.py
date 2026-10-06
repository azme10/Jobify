import json

from services.llm_client import chat_completion
from services.llm_scorer import extract_json_block
from config import OLLAMA_MODEL

SYSTEM_PROMPT = (
    "You are an expert in inclusive hiring language reviewing a candidate's own CV.\n\n"
    "Scan for phrasing that could narrow how the candidate is perceived or invite bias, across "
    "these categories:\n"
    "- Age-coded: 'young and dynamic', 'digital native', 'recent graduate' used as identity, "
    "graduation years or full date ranges that mainly serve to signal age.\n"
    "- Gendered or gender-coded: 'manpower', 'chairman', 'guys', and strongly gender-skewed "
    "descriptors ('aggressive', 'nurturing') used as self-description.\n"
    "- Nationality, language, and origin: 'native English speaker', nationality or visa status "
    "volunteered where it is not required, place of birth.\n"
    "- Personal and protected details that do not belong on a CV in most markets: marital "
    "status, number of children, religion, political affiliation, health or disability status, "
    "photographs, date of birth.\n"
    "- Culture-fit and hype language that reads as exclusionary or unserious: 'ninja', "
    "'rockstar', 'work hard play hard', 'like a family'.\n"
    "- Ableist idioms used casually: 'blind spot', 'crazy deadline', 'sanity check', 'tone deaf'.\n\n"
    "For each flag: quote the exact phrase as it appears in the CV, name the category plainly "
    "(e.g. 'Age', 'Gendered language', 'Personal detail'), and give a concrete neutral "
    "replacement the candidate can paste in — or advise removing the line entirely when that is "
    "the right call.\n\n"
    "Be precise, not puritanical. Do not flag ordinary technical vocabulary, legitimate job "
    "titles, or language that is standard and non-loaded in a professional CV. If nothing "
    "genuinely warrants a flag, return an empty flags array rather than inventing concerns.\n\n"
    "Return ONLY a JSON object matching the schema given. No preamble, no markdown fences."
)

SCHEMA_HINT = '{"flags": [{"phrase": string, "category": string, "suggestion": string}]}'


def detect_bias(cv_text: str) -> dict:
    user_prompt = f"CV TEXT:\n{cv_text}\n\nReturn JSON matching this schema exactly:\n{SCHEMA_HINT}"
    for attempt in range(2):
        response = chat_completion(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=800,
            temperature=0.2,
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = extract_json_block(raw)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            if attempt == 1:
                return {"flags": []}
            continue
