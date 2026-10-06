from services.llm_client import chat_completion
from services.llm_scorer import strip_echoed_prompt
from services.latex_cv_service import escape_latex
from config import OLLAMA_MODEL

SYSTEM_PROMPT = (
    "You are an expert career coach who writes cover letters that could only have been written "
    "by this candidate for this job.\n\n"
    "Before writing, identify: the two or three capabilities this job description cares about "
    "most, the strongest concrete evidence in the CV for each, and the one accomplishment most "
    "likely to make this particular hiring manager read on.\n\n"
    "Structure: open with a specific hook tied to the role or company rather than 'I am writing "
    "to apply'; spend the body proving fit with named projects, technologies, scale, and "
    "outcomes drawn from the CV; briefly address the most obvious gap or transition if the CV "
    "has one, framed as transferable strength; close with a direct, confident sign-off.\n\n"
    "Rules: every claim must trace back to the CV — never invent employers, metrics, or "
    "technologies. Mirror the job description's vocabulary where the candidate's real experience "
    "supports it. No filler ('team player', 'fast learner', 'passionate about excellence'), no "
    "restating the CV line by line, and no paragraph that would read identically for another "
    "candidate.\n\n"
    "Write in the requested tone. Return ONLY the cover letter body text: no preamble, no "
    "markdown, no subject line, no placeholders in brackets, and do not repeat the CV or job "
    "description back before your answer."
)


def generate_cover_letter(cv_text: str, job_description: str, tone: str = "professional") -> str:
    instruction = f"Write a cover letter in a {tone} tone, no more than 250 words."
    user_prompt = f"CV TEXT:\n{cv_text}\n\nJOB DESCRIPTION:\n{job_description}\n\n{instruction}"
    response = chat_completion(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=900,
        temperature=0.7,
    )
    raw = (response.choices[0].message.content or "").strip()
    return strip_echoed_prompt(raw, cv_text, job_description, instruction)


FULL_LETTER_SYSTEM_PROMPT = (
    "You are an expert career coach writing the body paragraphs of a cover letter. The date "
    "line, recipient block, salutation, and sign-off are assembled separately — write only the "
    "body itself.\n\n"
    "Before writing, identify: the two or three capabilities this job description cares about "
    "most, the strongest concrete evidence in the CV for each, and the one accomplishment most "
    "likely to make this specific reader keep reading.\n\n"
    "Structure: open with a specific hook tied to the role or company rather than 'I am writing "
    "to apply'; prove fit with named projects, technologies, scale, and outcomes drawn from the "
    "CV; briefly address the most obvious gap or transition if the CV has one, framed as "
    "transferable strength; close with a direct, confident call to action.\n\n"
    "Rules: every claim must trace back to the CV — never invent employers, metrics, "
    "technologies, or projects. If the CV states a number, you may use it; if it doesn't, "
    "describe the impact in concrete but unquantified terms instead of inventing a percentage, "
    "dollar figure, project name, or scale detail (record counts, user counts, data volume, team "
    "size, uptime, or any other quantity) that isn't in the CV. When in doubt whether a "
    "specific-sounding detail actually appears in the CV text, leave it out rather than risk "
    "fabricating it. Mirror the job description's vocabulary where the candidate's real "
    "experience supports it. No filler ('team player', 'fast learner'), no restating the CV line "
    "by line, and no paragraph that would read identically for another candidate.\n\n"
    "Write in the requested tone, 2-4 short paragraphs, no more than 300 words total. Separate "
    "paragraphs with a single blank line. Return ONLY the body paragraphs — no date, no "
    "recipient name, no 'Dear ...' greeting, no sign-off, no preamble, no markdown, no "
    "placeholders in brackets, and do not repeat the CV or job description back before your "
    "answer."
)


def _location_date_line(location: str, date: str) -> str:
    # Location and date are both optional in the form — a lone ", " with
    # nothing on either side would otherwise print as a stray floating comma.
    return ", ".join(p.strip() for p in (location, date) if p and p.strip())


def _render_cover_letter_latex(
    location: str, date: str, recipient_name: str, company_name: str, sender_name: str, paragraphs: list[str]
) -> str:
    date_line = _location_date_line(location, date)
    header_lines = " \\\\\n".join(escape_latex(line) for line in (recipient_name, company_name) if line.strip())
    body = "\n\n".join(escape_latex(p) for p in paragraphs)
    blocks = [line for line in (escape_latex(date_line), header_lines) if line]
    blocks.append(rf"Dear {escape_latex(recipient_name)},")
    blocks.append(body)
    blocks.append(f"Sincerely, \\\\\n{escape_latex(sender_name)}")
    doc_body = "\n\n".join(blocks)
    return rf"""\documentclass[11pt]{{article}}
\usepackage[margin=1in]{{geometry}}
\usepackage{{parskip}}
\pagestyle{{empty}}

\begin{{document}}

{doc_body}

\end{{document}}
"""


def generate_full_cover_letter(
    cv_text: str,
    job_description: str,
    sender_name: str,
    recipient_name: str,
    company_name: str,
    location: str,
    date: str,
    tone: str = "professional",
) -> dict:
    instruction = (
        f"Write the body in a {tone} tone. "
        f"Company you are applying to: {company_name or 'not given — do not name a company'}. "
        f"If you reference the company by name, use exactly that name — never a placeholder like "
        f"'[Company Name]'. If no company name is given, refer to it generically ('your team', "
        f"'this role') instead of inventing or templating a name."
    )
    user_prompt = f"CV TEXT:\n{cv_text}\n\nJOB DESCRIPTION:\n{job_description}\n\n{instruction}"
    response = chat_completion(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": FULL_LETTER_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=900,
        temperature=0.7,
    )
    raw = (response.choices[0].message.content or "").strip()
    body = strip_echoed_prompt(raw, cv_text, job_description, instruction)
    paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()] or [body]

    header_lines = "\n".join(line for line in (recipient_name, company_name) if line.strip())
    plain_blocks = [line for line in (_location_date_line(location, date), header_lines) if line]
    plain_blocks.append(f"Dear {recipient_name},")
    plain_blocks.append(body)
    plain_blocks.append(f"Sincerely,\n{sender_name}")
    plain_text = "\n\n".join(plain_blocks)
    latex = _render_cover_letter_latex(location, date, recipient_name, company_name, sender_name, paragraphs)
    return {"cover_letter": plain_text, "latex": latex}
