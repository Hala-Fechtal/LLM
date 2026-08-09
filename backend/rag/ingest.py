import os
from rag.document_loader import load_pdf_pages
from rag.text_splitter import split_documents
from rag.vector_store import add_document

def process_and_store_pdf(file_path: str):
    """
    Orchestrates the ingestion pipeline for a PDF document:
    1. Loads text from the PDF page by page.
    2. Splits the pages into structured chunks inheriting metadata.
    3. Embeds and stores each chunk's text and metadata in Qdrant.
    """
    print(f"[ingest] Starting ingestion for {file_path}")
    
    # 1. Load text
    pages = load_pdf_pages(file_path)
    if not pages:
        print(f"[ingest] Warning: No text could be extracted from {file_path}")
        return
        
    print(f"[ingest] Extracted {len(pages)} pages.")
    
    # 2. Split into chunks
    chunks = split_documents(pages, chunk_size=1000, chunk_overlap=200)
    print(f"[ingest] Split text into {len(chunks)} chunks.")
    
    # 3. Store chunks in vector database
    for i, chunk in enumerate(chunks):
        add_document(text=chunk["text"], metadata=chunk["metadata"])
        if (i + 1) % 10 == 0:
            print(f"[ingest] Stored {i + 1}/{len(chunks)} chunks...")
            
    print(f"[ingest] Successfully ingested {file_path}")
