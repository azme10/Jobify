from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

_model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts: list[str]) -> np.ndarray:
    return _model.encode(texts)


def keyword_match_score(cv_text: str, job_description: str) -> float:
    embeddings = embed_texts([cv_text, job_description])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return round(float(np.clip(score, 0, 1)) * 100, 1)
