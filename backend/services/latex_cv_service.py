import json

from services.llm_client import chat_completion
from services.llm_scorer import extract_json_block
from config import OLLAMA_MODEL

SYSTEM_PROMPT = (
    "You are an expert resume writer who rebuilds CVs to win a specific role.\n\n"
    "Method:\n"
    "1. Read the job description first and note the terminology it uses, the capabilities it "
    "prioritises, and the seniority it implies. That vocabulary should shape how you phrase the "
    "CV wherever the candidate's real experience supports it.\n"
    "2. Parse the CV completely. Capture every role, project, qualification, and skill — do not "
    "silently drop content because it seems less relevant; instead de-emphasise it by ordering "
    "and brevity.\n"
    "3. Rewrite each bullet to lead with a strong ownership verb, state what was actually built "
    "or changed, and end on the outcome. Prefer concrete systems, scale, and results over duties. "
    "Order bullets within each role so the most job-relevant one comes first.\n"
    "4. Separate paid roles ('experience') from personal, academic, or open-source work "
    "('projects'). Leave 'projects' as an empty list only if the CV genuinely lists none.\n"
    "5. Group skills into meaningful categories that mirror how this job description talks about "
    "them, rather than one undifferentiated list.\n"
    "6. Write 'summary' as 2-3 sentences positioning this candidate for this specific role: what "
    "they are, their strongest relevant evidence, and what they are targeting.\n\n"
    "Truthfulness is absolute. Never invent employers, dates, metrics, or technologies the CV "
    "does not support. If a bullet has no number, make it sharper and more concrete rather than "
    "inventing one. Reusing the job description's phrasing is good; claiming unearned experience "
    "is not.\n\n"
    "Return ONLY JSON, no preamble, no markdown fences."
)

SCHEMA_HINT = """{
  "name": string, "title": string, "phone": string, "email": string,
  "linkedin": string, "github": string, "summary": string,
  "education": [{"degree": string, "school": string, "dates": string}],
  "experience": [{"title": string, "company": string, "dates": string, "bullets": [string], "keywords": string}],
  "projects": [{"name": string, "technologies": string, "bullets": [string]}],
  "skills": {"category name": "comma-separated items"},
  "contributions": [string], "awards": [string]
}"""

_LATEX_ESCAPES = {
    "\\": r"\textbackslash{}",
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
}


def escape_latex(text: str) -> str:
    return "".join(_LATEX_ESCAPES.get(ch, ch) for ch in str(text))


def extract_cv_data(cv_text: str, job_description: str) -> dict:
    user_prompt = (
        f"CV TEXT:\n{cv_text}\n\nTARGET JOB DESCRIPTION:\n{job_description}\n\n"
        f"Return JSON matching this schema exactly:\n{SCHEMA_HINT}"
    )
    for attempt in range(2):
        response = chat_completion(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=3500,
            temperature=0.3,
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = extract_json_block(raw)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            if attempt == 1:
                raise ValueError("Could not extract structured CV data from the model output")
            continue


# The full original template architecture (verbatim macro set), shared by both the
# AI-extraction CV rewriter and the manual CV builder so there is exactly one
# source of truth for "the architecture" rather than two preambles drifting apart.
# Packages/macros unused by a given render path (e.g. tikz when no photo is
# supplied) are harmless — LaTeX ignores an unused \usepackage or \newcommand.
PREAMBLE = r"""\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage{tikz}
\usepackage[colorlinks = true,
            linkcolor = red,
            urlcolor  = blue,
            citecolor = blue,
            anchorcolor = blue]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{fontawesome5}
\usepackage{multicol}
\setlength{\multicolsep}{-3.0pt}
\setlength{\columnsep}{-1pt}
\input{glyphtounicode}

\hypersetup{pdfborder = 0 0 0}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1.19in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.4in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat{\section}{
  \vspace{-3pt}\scshape\raggedright\large\bfseries
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

\pdfgentounicode=1

\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\classesList}[4]{
    \item\small{
        {#1 #2 #3 #4 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{1.0\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textbf{\small #2} \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{1.001\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & \textbf{\small #2}\\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemi{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.0in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}
"""


def contact_line(data: dict) -> str:
    parts = []
    if data.get("phone"):
        parts.append(rf"\faPhone\ {escape_latex(data['phone'])}")
    if data.get("email"):
        parts.append(rf"\href{{mailto:{data['email']}}}{{\faEnvelope\ {escape_latex(data['email'])}}}")
    if data.get("linkedin"):
        parts.append(rf"\href{{https://{data['linkedin']}}}{{\faLinkedin\ {escape_latex(data['linkedin'])}}}")
    if data.get("github"):
        parts.append(rf"\href{{https://{data['github']}}}{{\faGithub\ {escape_latex(data['github'])}}}")
    return r" \quad \textbar \quad ".join(parts)


def plain_header_block(data: dict) -> str:
    """Centered header with no photo — used whenever a photo file isn't available,
    e.g. every AI-extraction CV, since PDF text extraction never yields an image."""
    return rf"""\begin{{center}}
    \textbf{{\Huge {escape_latex(data.get('name', ''))}}} \\[9pt]
    {{\fontsize{{14}}{{32}}\selectfont \textit{{{escape_latex(data.get('title', ''))}}}}} \\[5pt]
    \small{{{contact_line(data)}}}
\end{{center}}"""


def photo_header_block(data: dict, photo_filename: str) -> str:
    """Two-minipage header with a circular-cropped photo, matching the original
    architecture exactly. photo_filename must sit next to the .tex file when the
    user compiles it — we can't embed binary image bytes into LaTeX source text."""
    return rf"""\begin{{minipage}}[c]{{0.18\textwidth}}
\begin{{tikzpicture}}
    \clip (-0.15,0) circle (1.6cm);
    \node at (-0.1,-0.35) {{\includegraphics[width = 3.8cm]{{{photo_filename}}}}};
\end{{tikzpicture}}
\end{{minipage}}
\hspace{{1em}}
\begin{{minipage}}[c]{{0.78\textwidth}}
    \textbf{{\Huge {escape_latex(data.get('name', ''))}}} \\[9pt]
    \hspace*{{0em}}{{\fontsize{{14}}{{32}}\selectfont \textit{{ {escape_latex(data.get('title', ''))} }}}} \\[5pt]
    \small{{{contact_line(data)}}}
\end{{minipage}}"""


def education_block(education: list[dict]) -> str:
    lines = []
    for entry in education:
        line = (
            rf"{{\bf {escape_latex(entry.get('degree', ''))}}}, {escape_latex(entry.get('school', ''))}"
            rf" \textbf{{\hfill {{{escape_latex(entry.get('dates', ''))}}}}}\\"
        )
        lines.append(line)
        if entry.get("note"):
            lines.append(rf"\textit{{\small {escape_latex(entry['note'])}}}\\")
    return "\n".join(lines)


def experience_block(experience: list[dict]) -> str:
    blocks = []
    for entry in experience:
        bullets = "\n".join(
            rf"\item {escape_latex(b)}" for b in entry.get("bullets", [])
        )
        keywords = entry.get("keywords", "")
        keywords_line = rf"\textit{{KEYWORDS:}} {escape_latex(keywords)}" if keywords else ""
        blocks.append(
            rf"""\textbf{{{escape_latex(entry.get('title', ''))} - {escape_latex(entry.get('company', ''))} \hfill {escape_latex(entry.get('dates', ''))}}}
\begin{{itemize}}[leftmargin=0.15in, label=$\bullet$]
{bullets}
\end{{itemize}}
{keywords_line}"""
        )
    return "\n\n".join(blocks)


def projects_block(projects: list[dict]) -> str:
    entries = []
    for entry in projects:
        bullets = "\n".join(
            rf"\resumeItem{{{escape_latex(b)}}}" for b in entry.get("bullets", [])
        )
        entries.append(
            rf"""\resumeProjectHeading
      {{\textbf{{{escape_latex(entry.get('name', ''))}}}}}{{{escape_latex(entry.get('technologies', ''))}}}
      \resumeItemListStart
{bullets}
      \resumeItemListEnd"""
        )
    inner = "\n".join(entries)
    return f"\\resumeSubHeadingListStart\n{inner}\n\\resumeSubHeadingListEnd"


def skills_block(skills: dict) -> str:
    rows = "\n".join(
        rf"{escape_latex(category)} & {escape_latex(items)}\\"
        for category, items in skills.items()
        if str(items).strip()
    )
    return rf"""\begin{{tabular}}{{ @{{}} >{{\bfseries}}l @{{\hspace{{6ex}}}} l }}
{rows}
\end{{tabular}}"""


def list_block(items: list[str]) -> str:
    lines = "\n".join(rf"\item {escape_latex(item)}" for item in items)
    return rf"\begin{{itemize}}{chr(10)}{lines}{chr(10)}\end{{itemize}}"


def render_latex_cv(data: dict) -> str:
    body = rf"""
\begin{{document}}
{plain_header_block(data)}

\section{{Profile}}
  \small{{{escape_latex(data.get('summary', ''))}}}

\vspace{{-0.1cm}}
\section{{Education}}
{education_block(data.get('education', []))}

\vspace{{-0.1cm}}
\section{{Experience}}
{experience_block(data.get('experience', []))}
"""

    if data.get("projects"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Projects}}
{projects_block(data['projects'])}
"""

    body += rf"""
\vspace{{-0.1cm}}
\section{{Skills}}
{skills_block(data.get('skills') or {})}
"""

    if data.get("contributions"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Contributions}}
{list_block(data['contributions'])}
"""

    if data.get("awards"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Awards}}
{list_block(data['awards'])}
"""

    body += "\n\\end{document}\n"
    return PREAMBLE + body


def generate_latex_cv(cv_text: str, job_description: str) -> str:
    data = extract_cv_data(cv_text, job_description)
    return render_latex_cv(data)
