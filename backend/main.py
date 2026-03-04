from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag.llm import ask_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "RAG backend is running"}

@app.post("/chat")
def chat(data: Question):
    response = ask_llm(data.question)
    return {"response": response}