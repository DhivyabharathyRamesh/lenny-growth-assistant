import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, FileCode, Loader2, Sparkles } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ArtifactPanel } from "./components/ArtifactPanel";
import {
  fetchSessions,
  fetchSession,
  deleteSession,
  sendChatMessage,
  fetchApiInfo,
  type SessionSummary,
} from "./lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  artifact?: string | null;
}

const SUGGESTIONS = [
  "What is product-market fit according to Lenny's guests?",
  "Write a Ship30 atomic essay on retention loops",
  "Generate an HTML artifact: growth metrics dashboard mockup",
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const [footerLabel, setFooterLabel] = useState("Lenny Growth Assistant");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshSessions = useCallback(async () => {
    try {
      const list = await fetchSessions();
      setSessions(list);
    } catch {
      /* backend offline */
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    refreshSessions();
    fetchApiInfo()
      .then((info) => {
        setFooterLabel(`${info.llm_provider} · ${info.model} · ${info.database}`);
      })
      .catch(() => {});
  }, [refreshSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  const createNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setArtifact(null);
    setShowArtifact(false);
    setInput("");
  };

  const loadSession = async (id: string) => {
    if (id === sessionId && messages.length > 0) return;
    setLoadingSessionDetail(true);
    setShowArtifact(false);
    setArtifact(null);
    try {
      const detail = await fetchSession(id);
      setSessionId(detail.id);
      setMessages(
        detail.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          artifact: m.artifact,
        }))
      );
      const lastWithArtifact = [...detail.messages]
        .reverse()
        .find((m) => m.artifact);
      if (lastWithArtifact?.artifact) {
        setArtifact(lastWithArtifact.artifact);
      }
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "Could not load this chat. Is the backend running?",
        },
      ]);
    } finally {
      setLoadingSessionDetail(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Delete this chat permanently?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (sessionId === id) {
        createNewChat();
      }
    } catch {
      window.alert("Failed to delete session.");
    }
  };

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loadingChat) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoadingChat(true);

    try {
      const data = await sendChatMessage(userMessage, sessionId);
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

      await refreshSessions();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please make sure the backend and Ollama are running.",
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openArtifact = (content: string) => {
    setArtifact(content);
    setShowArtifact(true);
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-neutral-950 text-neutral-100 overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={sessionId}
        loadingSessions={loadingSessions}
        onNewChat={createNewChat}
        onSelectSession={loadSession}
        onDeleteSession={handleDeleteSession}
        footerLabel={footerLabel}
      />

      <div className="flex-1 flex min-w-0 min-h-0">
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-5 shrink-0 bg-neutral-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-500" />
              <h1 className="font-semibold text-[15px]">Lenny Growth Assistant</h1>
            </div>
            {showArtifact && artifact && (
              <button
                type="button"
                onClick={() => setShowArtifact(false)}
                className="lg:hidden text-sm text-emerald-400 hover:text-emerald-300"
              >
                Hide artifact
              </button>
            )}
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {loadingSessionDetail && (
                <div className="flex items-center justify-center gap-2 text-neutral-500 text-sm py-12">
                  <Loader2 size={18} className="animate-spin" />
                  Loading conversation…
                </div>
              )}

              {!loadingSessionDetail && messages.length === 0 && (
                <div className="text-center mt-16 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/15 flex items-center justify-center mx-auto mb-5">
                    <Bot size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-xl font-medium text-neutral-100">
                    How can I help you grow?
                  </p>
                  <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
                    RAG over Lenny&apos;s podcast transcripts — Q&amp;A, Ship30 essays, and
                    live artifacts.
                  </p>
                  <div className="mt-8 flex flex-col gap-2 max-w-lg mx-auto">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="text-left text-sm px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 hover:border-neutral-700 transition text-neutral-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loadingSessionDetail &&
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-neutral-800 text-neutral-100"
                          : "bg-neutral-900 border border-neutral-800"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none chat-markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                          {msg.content}
                        </p>
                      )}

                      {msg.artifact && (
                        <button
                          type="button"
                          onClick={() => openArtifact(msg.artifact!)}
                          className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition"
                        >
                          <FileCode size={15} />
                          View artifact
                        </button>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center shrink-0 mt-1">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}

              {loadingChat && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                    <span className="text-sm text-neutral-400">
                      Thinking with Lenny&apos;s knowledge…
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <footer className="border-t border-neutral-800 p-4 shrink-0 bg-neutral-950">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Lenny Growth Assistant…"
                rows={1}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600 text-sm min-h-[52px] max-h-36"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loadingChat || !input.trim()}
                className="h-[52px] w-[52px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition shrink-0"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </footer>
        </main>

        {showArtifact && artifact && (
          <>
            <button
              type="button"
              aria-label="Close artifact overlay"
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              onClick={() => setShowArtifact(false)}
            />
            <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl lg:static lg:z-auto lg:flex lg:max-w-none">
              <ArtifactPanel content={artifact} onClose={() => setShowArtifact(false)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
