"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<any[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);

      setDocumentId(null);   // reset id ancien document

      setUploadMessage("");

      setAnswer("");

      setSources([]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
        setUploadMessage("");
        setAnswer("");
        setSources([]);
      } else {
        setUploadMessage("❌ Please upload a valid PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.document_id) {
        setDocumentId(null);
        setUploadMessage(`❌ ${data.detail || data.error || "Upload failed"}`);
        return;
      }

      setDocumentId(data.document_id);

      setUploadMessage("✅ Document uploaded successfully");
    } catch (error) {
      console.error(error);
      setUploadMessage("❌ Error uploading document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!question.trim()) return;

    if (!documentId) {

      setAnswer("Please upload a document first.");

      return;
    }

    setIsAsking(true);
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          document_id: documentId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnswer(`❌ ${data.detail || "Failed to fetch response"}`);
        return;
      }

      setAnswer(data.response);
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error(error);
      setAnswer("❌ Network error: could not reach the backend.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-12 selection:bg-indigo-500/30 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8 w-full">

        {/* Header */}
        <header className="text-center mb-12 py-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm pb-2">
              AI Research Assistant
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            Upload your PDF and get instant, grounded answers.
          </p>
        </header>

        {/* Section 1: Upload */}
        <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all hover:bg-slate-900/80">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-indigo-300">
            <span className="flex items-center justify-center w-8 h-8 bg-indigo-500/10 rounded-lg text-sm text-indigo-400">1</span>
            Upload PDF Document
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50'} rounded-2xl cursor-pointer transition-all ${!isDragging && 'bg-slate-950/50'} group text-center`}
            >
              <svg className={`h-8 w-8 ${isDragging ? 'text-indigo-400 scale-110' : 'text-slate-500'} group-hover:text-indigo-400 mb-2 transition-all`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-slate-300 font-medium">
                {file ? file.name : (isDragging ? "Drop PDF here" : "Select or drag a PDF file")}
              </span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full sm:w-auto min-w-[160px] px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Upload Document"
              )}
            </button>
          </div>

          {uploadMessage && (
            <div className={`mt-6 text-center font-medium p-4 rounded-xl transition-all ${uploadMessage.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : uploadMessage.includes('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300'}`}>
              {uploadMessage}
            </div>
          )}
        </section>

        {/* Section 2: Question */}
        <section className={`bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all ${!uploadMessage.includes('✅') ? 'opacity-50 grayscale pointer-events-none' : 'hover:bg-slate-900/80'}`}>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-purple-300">
            <span className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-lg text-sm text-purple-400">2</span>
            Ask a Question
          </h2>

          <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isAsking || !uploadMessage.includes('✅')}
              placeholder="e.g. What are the main contributions of this paper?"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
            >
              {isAsking ? (
                <span className="flex gap-1.5 justify-center items-center h-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </section>

        {/* Section 3: Answer Display */}
        {answer && (
          <section className="bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 transition-all">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-pink-300">
              <span className="flex items-center justify-center p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              AI Response
            </h2>
            <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
              <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                {answer}
              </p>
            </div>

            {sources && sources.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                  Sources Referenced
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sources.map((src, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md">
                          Page {src.page}
                        </span>
                        <span className="text-xs text-slate-500 max-w-[150px] truncate" title={src.source}>
                          {src.source}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 italic line-clamp-3 leading-relaxed">
                        "{src.text_preview}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
