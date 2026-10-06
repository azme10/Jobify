import logging

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import APIError

logger = logging.getLogger("jobify")

from services.pdf_extractor import extract_text
from services.embeddings import keyword_match_score
from services.llm_scorer import score_cv
from services.interview_service import generate_interview_questions, score_interview_answer
from services.cover_letter_service import generate_cover_letter, generate_full_cover_letter
from services.bias_service import detect_bias
from services.job_taxonomy import recommend_jobs
from services.latex_cv_service import generate_latex_cv
from services.project_keywords_service import suggest_project_keywords
from services.cv_builder_service import render_full_latex_cv
from services.llm_client import LocalLLMUnavailableError, check_ollama_health
from models.schemas import (
    AnalysisResponse,
    InterviewQuestionsResponse,
    InterviewFeedbackResponse,
    JobRecommendationsResponse,
    CoverLetterResponse,
    BiasCheckResponse,
    LatexCvResponse,
    ProjectKeywordsResponse,
    BuildCvRequest,
)

app = FastAPI(title="Jobify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Starlette only attaches CORS headers to responses that flow back through
# CORSMiddleware normally. An exception with no registered handler skips that
# path entirely, so the browser sees a header-less 500 and reports it as a
# CORS failure instead of the real error. Registering handlers here (rather
# than try/except in every route) keeps every response, including failures,
# on the same path CORSMiddleware wraps.
@app.exception_handler(LocalLLMUnavailableError)
async def local_llm_unavailable_handler(request: Request, exc: LocalLLMUnavailableError):
    logger.error("Ollama unavailable on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(APIError)
async def openai_error_handler(request: Request, exc: APIError):
    logger.error("Local LLM request failed on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=502,
        content={"detail": "The local AI model returned an error. Please try again."},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


@app.on_event("startup")
async def _log_ollama_health():
    ok, message = check_ollama_health()
    (logger.info if ok else logger.warning)(message)


async def _extract_cv_text(cv_file: UploadFile | None, cv_text: str | None) -> str:
    # Pasted LaTeX source (or plain text) skips PDF extraction entirely — its section
    # commands give the LLM cleaner structure than a flattened PDF text dump ever can.
    if cv_text and cv_text.strip():
        return cv_text.strip()
    if cv_file is None:
        raise HTTPException(400, "Provide either a CV file or pasted CV text")
    if cv_file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted")
    pdf_bytes = await cv_file.read()
    extracted = extract_text(pdf_bytes)
    if not extracted.strip():
        raise HTTPException(422, "Could not extract text from this PDF")
    return extracted


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    job_description: str = Form(...),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)

    keyword_pct = keyword_match_score(cv_text, job_description)
    # Seniority comes back from score_cv rather than a second call: the free tier allows
    # only 50 requests/day, so one analysis should cost one request, not two.
    llm_result = score_cv(cv_text, job_description)

    seniority = llm_result.get("seniority_level", "Mid")
    if seniority not in ("Junior", "Mid", "Senior"):
        seniority = "Mid"

    overall = round(
        0.3 * keyword_pct
        + 0.25 * llm_result["clarity_score"]
        + 0.25 * llm_result["impact_verb_score"]
        + 0.2 * (100 - len(llm_result["formatting_flags"]) * 10)
    )

    return AnalysisResponse(
        keyword_match_pct=keyword_pct,
        seniority_level=seniority,
        clarity_score=llm_result["clarity_score"],
        impact_verb_score=llm_result["impact_verb_score"],
        requirement_matches=llm_result.get("requirement_matches", []),
        missing_keywords=llm_result.get("missing_keywords", []),
        formatting_flags=llm_result["formatting_flags"],
        rewrite_suggestions=llm_result["rewrite_suggestions"],
        overall_score=max(0, min(100, overall)),
    )


@app.post("/interview/questions", response_model=InterviewQuestionsResponse)
async def interview_questions(
    job_description: str = Form(...),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    questions = generate_interview_questions(cv_text, job_description)
    return InterviewQuestionsResponse(questions=questions)


@app.post("/interview/feedback", response_model=InterviewFeedbackResponse)
async def interview_feedback(
    question: str = Form(...),
    answer: str = Form(...),
    job_description: str = Form(...),
):
    result = score_interview_answer(question, answer, job_description)
    return InterviewFeedbackResponse(**result)


@app.post("/recommend-jobs", response_model=JobRecommendationsResponse)
async def recommend_jobs_endpoint(
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    return JobRecommendationsResponse(recommendations=recommend_jobs(cv_text))


@app.post("/cover-letter", response_model=CoverLetterResponse)
async def cover_letter_endpoint(
    job_description: str = Form(...),
    tone: str = Form("professional"),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    letter = generate_cover_letter(cv_text, job_description, tone)
    return CoverLetterResponse(cover_letter=letter)


@app.post("/bias-check", response_model=BiasCheckResponse)
async def bias_check_endpoint(
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    return BiasCheckResponse(**detect_bias(cv_text))


@app.post("/generate-cv", response_model=LatexCvResponse)
async def generate_cv_endpoint(
    job_description: str = Form(...),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    try:
        latex = generate_latex_cv(cv_text, job_description)
    except ValueError as exc:
        raise HTTPException(502, str(exc))
    return LatexCvResponse(latex=latex)


@app.post("/project-keywords", response_model=ProjectKeywordsResponse)
async def project_keywords_endpoint(
    job_description: str = Form(...),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    return ProjectKeywordsResponse(**suggest_project_keywords(cv_text, job_description))


@app.post("/build-cv", response_model=LatexCvResponse)
async def build_cv_endpoint(payload: BuildCvRequest):
    # Pure template fill from user-typed fields — no LLM call, so nothing to
    # fabricate and no local-model latency for this endpoint.
    return LatexCvResponse(latex=render_full_latex_cv(payload.model_dump()))


@app.post("/full-cover-letter", response_model=CoverLetterResponse)
async def full_cover_letter_endpoint(
    job_description: str = Form(...),
    sender_name: str = Form(...),
    recipient_name: str = Form("Hiring Manager"),
    company_name: str = Form(""),
    location: str = Form(""),
    date: str = Form(""),
    tone: str = Form("professional"),
    cv_file: UploadFile | None = File(None),
    cv_text: str | None = Form(None),
):
    cv_text = await _extract_cv_text(cv_file, cv_text)
    result = generate_full_cover_letter(
        cv_text, job_description, sender_name, recipient_name, company_name, location, date, tone
    )
    return CoverLetterResponse(**result)
