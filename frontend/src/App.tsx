import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, Send, Bot, User, FileCode, Loader2, Trash2, X } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
  artifact?: string | null;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const createNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setArtifact(null);
    setShowArtifact(false);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat/`, {
        session_id: sessionId,
        message: userMessage,
      });

      const data = res.data;
      setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          artifact: data.artifact,
        },
      ]);

      if (data.artifact) {
        setArtifact(data.artifact);
        setShowArtifact(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 bg-[#141414] border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-medium text-sm"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="px-4 mt-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Lenny Growth Assistant
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Ask product & growth questions, generate Ship30 essays, or create live HTML artifacts.
          </p>
        </div>

        <div className="mt-auto p-4 text-xs text-gray-600 border-t border-gray-800">
          Local Demo • Ollama + Lenny Transcripts
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-semibold">Lenny Growth Assistant</h1>
          {sessionId && (
            <span className="text-xs text-gray-500">Session: {sessionId.slice(0, 8)}...</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.length === 0 && (
              <div className="text-center mt-24 text-gray-500">
                <Bot size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-xl font-medium text-gray-300">How can I help you grow?</p>
                <p className="mt-3 text-sm max-w-md mx-auto">
                  Try asking about product-market fit, request a Ship30 essay, or generate an interactive HTML artifact.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                  msg.role === "user"
                    ? "bg-[#2a2a2a]"
                    : "bg-[#1a1a1a] border border-gray-800"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-[15px]">{msg.content}</p>
                  )}

                  {msg.artifact && (
                    <button
                      onClick={() => {
                        setArtifact(msg.artifact!);
                        setShowArtifact(true);
                      }}
                      className="mt-3 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <FileCode size={15} />
                      Open in Artifact Viewer
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className="text-sm text-gray-400">Thinking with Lenny's knowledge...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about growth, request a Ship30 essay, or generate an artifact..."
              className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:border-emerald-600 text-sm min-h-[52px] max-h-32"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-[52px] w-[52px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Artifact Viewer - Wider */}
      {showArtifact && artifact && (
        <div className="w-[520px] border-l border-gray-800 bg-[#111] flex flex-col flex-shrink-0">
          <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2 font-medium text-sm">
              <FileCode size={17} />
              Artifact Viewer
            </div>
            <button
              onClick={() => setShowArtifact(false)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-[#0a0a0a]">
            {artifact.trim().startsWith("<!") || artifact.trim().startsWith("<html") || artifact.trim().startsWith("<div") || artifact.trim().startsWith("<") ? (
              <iframe
                srcDoc={artifact}
                title="Artifact Preview"
                className="w-full h-full min-h-[700px] bg-white rounded-lg"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{artifact}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;