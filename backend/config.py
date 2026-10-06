import os
from dotenv import load_dotenv

load_dotenv()

# Local-only: all LLM calls go through Ollama's OpenAI-compatible endpoint. There is
# no hosted fallback, so CV/job data never leaves this machine for inference.
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-7b-8192")
