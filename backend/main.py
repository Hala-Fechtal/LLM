from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import uuid

from rag.llm import ask_llm
from rag.vector_store import add_document, search_documents, create_collection
from rag.document_loader import load_pdf_pages
from rag.text_splitter import split_documents

app = FastAPI()

# stocke l'id du document actuellement chargé
current_document_id = None


@app.on_event("startup")
def on_startup():
    # s'assure que la collection Qdrant existe avant toute insertion/recherche
    create_collection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request models ----------

class Question(BaseModel):
    question: str


class TextInput(BaseModel):
    text: str


# ---------- Root ----------

@app.get("/")
def read_root():
    return {"message": "RAG backend is running"}


# ---------- Chat endpoint (RAG avec citations) ----------

class ChatRequest(BaseModel):
    question: str
    document_id: str


@app.post("/chat")
def chat(data: ChatRequest):

    if not data.document_id:
        return {
            "response": "Missing document_id",
            "sources": []
        }

    # 🔎 search only inside current document
    try:
        relevant_payloads = search_documents(
            query=data.question,
            document_id=data.document_id,
            top_k=4
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector search failed: {e}")

    if not relevant_payloads:
        return {
            "response": "No relevant context found in the document.",
            "sources": []
        }

    # construire contexte
    context_blocks = []
    sources = []

    for payload in relevant_payloads:

        text = payload.get("text", "")

        page = payload.get("page", "?")

        paragraph = payload.get("paragraph", "?")

        source = payload.get("source", "Unknown")

        context_blocks.append(
            f"[Source: {source}, Page {page}, Paragraph {paragraph}]\n{text}"
        )

        sources.append({
            "page": page,
            "paragraph": paragraph,
            "source": source,
            "text_preview": text[:200] + "..." if len(text) > 200 else text
        })

    context = "\n\n".join(context_blocks)

    prompt = f"""
You are a research assistant.

Answer ONLY using the context below.

Always cite page numbers.

Context:
{context}

Question:
{data.question}
"""

    try:
        answer = ask_llm(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {e}")

    return {
        "response": answer,
        "sources": sources
    }


# ---------- Add plain text ----------

@app.post("/add-text")
def add_text(data: TextInput):

    add_document(
        text=data.text,
        metadata={
            "source": "manual_input",
            "page": 1,
            "paragraph": 1,
            "document_id": "manual"
        }
    )

    return {"message": "Text added successfully."}


# ---------- Upload PDF ----------

@app.post("/upload-pdf")
def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    temp_path = f"temp_{file.filename}"

    try:

        # sauvegarder temporairement
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1️⃣ generate stable UUID & extraction pages
        document_id = str(uuid.uuid4())
        pages = load_pdf_pages(temp_path, document_id)

        if not pages:
            raise HTTPException(status_code=422, detail="No text could be extracted from the PDF.")

        # 2️⃣ chunking avec metadata
        chunks = split_documents(pages)

        if not chunks:
            raise HTTPException(status_code=422, detail="Chunking failed.")

        # 3️⃣ stocker dans Qdrant
        for chunk in chunks:

            add_document(
                text=chunk["text"],
                metadata=chunk["metadata"]
            )

        print("Indexed document_id:", document_id)

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)

    return {
        "message": f"{file.filename} indexed successfully",
        "document_id": document_id
    }