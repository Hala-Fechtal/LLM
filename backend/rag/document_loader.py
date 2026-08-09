import pypdf
import os
from typing import List, Dict, Any

def load_pdf_pages(file_path: str, document_id: str) -> List[Dict[str, Any]]:
    """
    Reads a PDF file using pypdf and extracts text page by page.
    Returns a list of dictionaries, each containing the 'text' of the page
    and its 'metadata' (page number, source filename, document_id).
    """
    pages_data = []
    try:
        reader = pypdf.PdfReader(file_path)
        
        # Clean up the filename if it was saved as a temporary file in FastAPI
        filename = os.path.basename(file_path)
        if filename.startswith("temp_"):
            filename = filename[5:]
            
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                pages_data.append({
                    "text": text.strip(),
                    "metadata": {
                        "page": i + 1,
                        "source": filename,
                        "document_id": document_id
                    }
                })
        
        return pages_data
    except Exception as e:
        print(f"[document_loader] Error reading {file_path}: {e}")
        return []
