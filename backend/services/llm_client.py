import logging

import httpx
from openai import OpenAI, APIConnectionError

from config import OLLAMA_BASE_URL, OLLAMA_MODEL

logger = logging.getLogger("jobify")

# Ollama's OpenAI-compatible endpoint ignores the API key entirely, but the OpenAI
# client requires some non-empty string to be set — "ollama" is Ollama's own
# documented convention for this, not a real credential.
_client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")


class LocalLLMUnavailableError(Exception):
    """Raised when the local Ollama server can't be reached. Kept distinct from a
    normal API error so callers can tell the user to start Ollama, rather than
    silently retrying against a hosted provider (there is none) or showing a
    generic failure."""


def check_ollama_health() -> tuple[bool, str]:
    """Best-effort check for logging at startup. Not required for correctness —
    chat_completion() enforces the real guarantee (no silent hosted fallback) on
    every call regardless of what this reports."""
    root = OLLAMA_BASE_URL.removesuffix("/v1").removesuffix("/")
    try:
        response = httpx.get(f"{root}/api/tags", timeout=3)
        response.raise_for_status()
        models = [m.get("name", "") for m in response.json().get("models", [])]
        if not any(OLLAMA_MODEL in name for name in models):
            return False, (
                f"Ollama is running but '{OLLAMA_MODEL}' was not found. "
                f"Installed models: {', '.join(models) or 'none'}. "
                f"Run: ollama create {OLLAMA_MODEL} -f Qwen25.modelfile"
            )
        return True, f"Ollama is running with '{OLLAMA_MODEL}' available."
    except httpx.HTTPError as exc:
        return False, f"Ollama is not reachable at {root} ({exc})."


def chat_completion(**kwargs):
    """Run a chat completion against the local Qwen model via Ollama.

    No hosted fallback: if Ollama is unreachable, the CV/job description must not
    go anywhere else, so this raises LocalLLMUnavailableError instead of retrying
    against a remote provider.
    """
    try:
        return _client.chat.completions.create(**kwargs)
    except APIConnectionError as exc:
        logger.error("Ollama unreachable at %s: %s", OLLAMA_BASE_URL, exc)
        raise LocalLLMUnavailableError(
            "Local LLM unavailable. Please make sure Ollama is running and "
            f"'{OLLAMA_MODEL}' is installed."
        ) from exc
