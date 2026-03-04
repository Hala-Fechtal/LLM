from sentence_transformers import SentenceTransformer

# Initialize the model globally so it's loaded only once when the server starts.
# 'all-MiniLM-L6-v2' is a very popular, fast, and efficient model for English text embeddings.
# It outputs vectors of 384 dimensions.
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list[float]:
    """
    Takes a string of text and returns its vector embedding as a list of floats.
    """
    # .encode() returns a NumPy array, we convert it to a standard Python list
    embedding = model.encode(text)
    return embedding.tolist()
