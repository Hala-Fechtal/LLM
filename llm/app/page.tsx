"use client";

import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch from backend");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to the RAG backend. Make sure FastAPI is running!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-3xl flex-1 flex flex-col pt-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            RAG Assistant
          </h1>
          <p className="text-neutral-400">Ask any question to your backend</p>
        </header>

        <div className="flex-1 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 sm:p-6 mb-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4 shadow-xl">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              Your conversation will appear here.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-bl-none"
                    }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-full pl-6 pr-16 py-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-neutral-100 placeholder:text-neutral-500 shadow-lg disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
