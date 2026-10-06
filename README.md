# Jobify

Upload a CV (PDF) and paste a job description to get an instant ATS-style match score, a keyword-gap breakdown, and AI rewrite suggestions for weak bullet points. Stateless — no login, nothing stored. All LLM inference runs **locally via Ollama**, so your CV and job data never leave your machine.

## Run locally

### 1. Ollama (local LLM)

Install [Ollama](https://ollama.com), then pull the base model and build the app's context-extended variant:

```bash
ollama pull qwen2.5:7b
cd backend
ollama create qwen2.5-7b-8192 -f Qwen25.modelfile
ollama serve   # if not already running
```

The modelfile pins 8192 tokens of context and `temperature 0.2` for consistent JSON output. If Ollama isn't running, the backend returns a clear "Local LLM unavailable" error — there is no hosted fallback.

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # defaults point at localhost:11434 and qwen2.5-7b-8192
uvicorn main:app --reload --port 8000
```

### 3. Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173. Click **"View a sample result"** to see the full scorecard UI — including every tool below — without needing Ollama or the backend running.

## Stretch features ("Go deeper" tools)

Available as a sidebar of tools under the main scorecard once you've analyzed a CV:

| Tool | Endpoint | How it works |
|---|---|---|
| AI mock-interview simulator | `POST /interview/questions`, `POST /interview/feedback` | LLM generates questions from the CV/job gap; scores a typed answer against a rubric |
| Semantic job-role recommender | `POST /recommend-jobs` | Embeds the CV and a static ~35-title job taxonomy, ranks by cosine similarity |
| Personalized cover letter generator | `POST /cover-letter` | Combines CV + job description + a chosen tone into a drafted letter |
| Bias / inclusive-language detector | `POST /bias-check` | Zero-shot LLM prompt flags gendered/age-coded/exclusionary phrasing with a suggested rewrite |
| Project keyword suggestions | `POST /project-keywords` | Extracts the CV's Projects section into structured data, renders it as LaTeX (unambiguous section/field boundaries help the model reason about it), then asks the LLM which job-description keywords each project is missing |
| LaTeX CV generator | `POST /generate-cv` | LLM extracts the CV into structured JSON (name, education, experience, **projects**, skills, ...) tailored to the job description; a deterministic Python renderer fills that data into a fixed `.tex` template — LaTeX syntax is never left up to the model, so it can't come out broken |

`project-keywords` and `generate-cv` share the same structured-extraction step (`services/latex_cv_service.extract_cv_data`), which also pulls out a `projects` list (personal/academic/open-source work, kept separate from paid `experience`) — reused rather than re-implemented.

## Notes

- The LLM can still wrap JSON in prose or echo the input back before answering, even at low temperature. `services/llm_scorer.py` provides `extract_json_block()` (pulls the outermost `{...}`/`[...]` instead of requiring the whole response to be valid JSON) and `strip_echoed_prompt()` (cuts anything up through a verbatim repeat of the input), reused across `interview_service.py`, `bias_service.py`, and `cover_letter_service.py`.
- LLM calls go through Ollama's OpenAI-compatible endpoint (`http://localhost:11434/v1`). `services/llm_client.py` keeps a hard guarantee: if Ollama is unreachable it raises `LocalLLMUnavailableError` (surfaced to the user as "start Ollama / install the model") instead of ever falling back to a hosted provider. `check_ollama_health()` runs at startup and logs exactly which fix command to run if the model is missing.
- The frontend supports light/dark mode (follows system preference, toggle in the header) and is responsive down to 375px.
- Unhandled backend errors are caught by global exception handlers in `main.py` and returned as a normal `503`/`500` JSON response. Without this, an unhandled exception skips Starlette's CORS middleware and the browser misreports it as a CORS failure ("No 'Access-Control-Allow-Origin' header") instead of showing the real error.
- `requirements.txt` versions were bumped from the originally-planned pins to ones that actually publish Python 3.13 wheels (the old pins predate 3.13 support and fail to build from source on Windows).
