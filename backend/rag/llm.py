import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def ask_llm(prompt: str):
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing. Check your .env file.")

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        },
        timeout=30
    )

    data = response.json()

    if not response.ok:
        # Groq renvoie généralement {"error": {"message": "..."}} en cas de problème
        message = data.get("error", {}).get("message", response.text)
        raise RuntimeError(f"Groq API error ({response.status_code}): {message}")

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError(f"Unexpected response format from Groq: {data}")

