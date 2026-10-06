from services.latex_cv_service import (
    PREAMBLE,
    education_block,
    experience_block,
    projects_block,
    skills_block,
    list_block,
    plain_header_block,
    photo_header_block,
    escape_latex,
)


def _contributions_block(contributions: list[dict]) -> str:
    """The original template's Contributions section mixes two shapes freely: a
    role+org line with no bullets, and a bare heading with bullets. This renders
    either shape from one flexible entry: {heading, dates, subtext, bullets}."""
    blocks = []
    for entry in contributions:
        heading = escape_latex(entry.get("heading", ""))
        dates = entry.get("dates", "")
        header_line = rf"\textbf{{{heading}{f' \\hfill {escape_latex(dates)}' if dates else ''}}}"
        piece = header_line
        if entry.get("subtext"):
            piece += f" \\\\\n{escape_latex(entry['subtext'])}"
        bullets = entry.get("bullets") or []
        if bullets:
            items = "\n".join(rf"    \item {escape_latex(b)}" for b in bullets)
            piece += f"\n\\begin{{itemize}}\n{items}\n\\end{{itemize}}"
        blocks.append(piece)
    return "\n\n".join(blocks)


def render_full_latex_cv(data: dict) -> str:
    """Deterministic template fill for the manual CV builder — no LLM call. The
    user types their own information directly, so there's nothing to extract or
    rewrite, and no risk of the model fabricating or dropping a detail."""
    include_photo = bool(data.get("include_photo"))
    photo_filename = (data.get("photo_filename") or "photo.jpg").strip() or "photo.jpg"
    header = photo_header_block(data, photo_filename) if include_photo else plain_header_block(data)

    body = rf"""
\begin{{document}}
{header}

\section{{Profile}}
  \small{{{escape_latex(data.get('summary', ''))}}}

\vspace{{-0.1cm}}
\section{{Education}}
{education_block(data.get('education', []))}
"""

    if data.get("experience"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Experience}}
{experience_block(data['experience'])}
"""

    if data.get("projects"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Projects}}
{projects_block(data['projects'])}
"""

    skills = {c: i for c, i in (data.get("skills") or {}).items() if str(i).strip()}
    if skills:
        body += rf"""
\vspace{{-0.1cm}}
\section{{Skills}}
{skills_block(skills)}
"""

    if data.get("contributions"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Contributions}}
{_contributions_block(data['contributions'])}
"""

    if data.get("awards"):
        body += rf"""
\vspace{{-0.1cm}}
\section{{Awards}}
{list_block(data['awards'])}
"""

    body += "\n\\end{document}\n"
    return PREAMBLE + body
