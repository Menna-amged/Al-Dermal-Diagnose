"""
chatbot_api.py
──────────────
FastAPI REST wrapper for the RAG skin-disease chatbot.

Run
───
uvicorn chatbot_api:app --host 0.0.0.0 --port 8001
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from pipeline import chat

app = FastAPI(title="DermaCam Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[HistoryMessage] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    result = chat(req.message, history=history)
    return {
        "reply": result["answer"],
        "lang":  result["lang"],
        "score": result["score"],
    }
