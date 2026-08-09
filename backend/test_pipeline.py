import requests
import time
import os
from fpdf import FPDF

def create_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=15)
    
    text = (
        "This is a dummy research paper about Antigravity. "
        "It was published in the year 2026 by the advanced AI team. "
        "Antigravity is formed by manipulating spacetime with heavy energy fields. "
        "This paper proves that AI can write its own research and read it."
    )
    
    pdf.multi_cell(0, 10, text)
    pdf.output("sample.pdf")

def process_test():
    print("Writing dummy PDF...")
    create_pdf()

    print("Uploading dummy PDF...")
    with open("sample.pdf", "rb") as f:
        files = {"file": ("sample.pdf", f, "application/pdf")}
        response = requests.post("http://localhost:8000/upload-pdf", files=files)
        
    print(f"Upload Response {response.status_code}: {response.json()}")
    if response.status_code != 200:
        return
        
    print("\nWaiting 2 seconds for Qdrant storage to finalize...")
    time.sleep(2)

    print("Querying the RAG system...")
    question = {"question": "What is the research paper about, when was it published, and how is Antigravity formed?"}
    response = requests.post("http://localhost:8000/chat", json=question)
    
    print(f"\nChat Response {response.status_code}:")
    print(response.json()["response"])
    
if __name__ == "__main__":
    process_test()
