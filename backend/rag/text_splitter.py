from typing import List, Dict, Any

def split_text_simple(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    A simpler, safer chunking mechanism focusing strictly on characters.
    """
    if not text:
        return []
        
    chunks = []
    i = 0
    while i < len(text):
        chunk = text[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk.strip())
        i += chunk_size - chunk_overlap
        
    return chunks

def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Legacy split function that only returns strings without metadata."""
    return split_text_simple(text, chunk_size, chunk_overlap)


def split_documents(pages: List[Dict[str, Any]], chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Dict[str, Any]]:
    """
    Takes a list of page dictionaries and chunks the text within each page.
    Preserves original metadata (page, source) and adds paragraph_id to metadata.
    Returns structured chunks ready for storage.
    """
    structured_chunks = []
    for page_data in pages:
        text = page_data["text"]
        metadata = page_data["metadata"]
        
        # Split the current page text
        chunks = split_text_simple(text, chunk_size, chunk_overlap)
        
        # Build the final structured chunks including the metadata overrides
        for p_idx, chunk in enumerate(chunks):
            chunk_metadata = metadata.copy()
            chunk_metadata["paragraph"] = p_idx + 1
            
            structured_chunks.append({
                "text": chunk,
                "metadata": chunk_metadata
            })
            
    return structured_chunks
