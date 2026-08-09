from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from rag.embeddings import get_embedding
import uuid
from typing import List, Dict, Any

# Connect to local Qdrant instance
client = QdrantClient(host="localhost", port=6333)

COLLECTION_NAME = "documents"
VECTOR_SIZE = 384


def create_collection():
    """
    Creates the Qdrant collection if it doesn't already exist.
    Uses cosine distance and 384-dimensional vectors (all-MiniLM-L6-v2).
    """
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        print(f"[vector_store] Collection '{COLLECTION_NAME}' created.")
    else:
        print(f"[vector_store] Collection '{COLLECTION_NAME}' already exists.")


def add_document(text: str, metadata: Dict[str, Any] = None):
    """
    Embeds the given text and stores it in Qdrant with the original text as payload.
    Any metadata provided is merged directly into the payload so it can be retrieved.
    """
    embedding = get_embedding(text)
    
    payload = {"text": text}
    if metadata:
        payload.update(metadata)
        
    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=embedding,
        payload=payload,
    )
    client.upsert(collection_name=COLLECTION_NAME, points=[point])


def search_documents(
    query: str,
    document_id: str,
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """
    Search only inside the current document using document_id filter.
    """
    query_embedding = get_embedding(query)
    
    query_filter = Filter(
        must=[
            FieldCondition(
                key="document_id",
                match=MatchValue(value=document_id),
            )
        ]
    )

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        limit=top_k,
        query_filter=query_filter
    )

    return [hit.payload for hit in results if hit.payload]
