import os
os.environ["HF_HUB_OFFLINE"] = "1"   # use cached model only, no network calls

import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer

INDEX_PATH  = "faiss_index.bin"
CHUNKS_PATH = "chunks.pkl"
MODEL_NAME  = "BAAI/bge-m3"

# Module-level singletons (replaces @st.cache_resource so it works in FastAPI too)
_model  = None
_index  = None
_chunks = None


def _load():
    global _model, _index, _chunks
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    if _index is None:
        _index = faiss.read_index(INDEX_PATH)
    if _chunks is None:
        with open(CHUNKS_PATH, "rb") as f:
            _chunks = pickle.load(f)


def retrieve(query: str, top_k: int = 5, threshold: float = 0.40):
    _load()
    query_vec = _model.encode([query], normalize_embeddings=True)
    query_vec = np.array(query_vec, dtype="float32")

    scores, indices = _index.search(query_vec, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if score < threshold:
            continue
        chunk = _chunks[idx].copy()
        chunk["score"] = float(score)
        results.append(chunk)

    return results
