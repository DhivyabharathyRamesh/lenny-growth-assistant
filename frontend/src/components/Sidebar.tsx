import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { SessionSummary } from "../lib/api";

interface SidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  loadingSessions: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  footerLabel?: string;
}

function formatSessionDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function Sidebar({
  sessions,
  activeSessionId,
  loadingSessions,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  footerLabel,
}: SidebarProps) {
  return (
    <aside className="w-[17.5rem] bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0 min-h-0">
      <div className="p-3 border-b border-neutral-800/80">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition text-sm font-medium"
        >
          <Plus size={18} />
          New chat
        </button>
      </div>

      <div className="px-3 pt-3 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Recent chats
        </p>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 space-y-0.5 sidebar-scroll">
        {loadingSessions && (
          <p className="px-3 py-2 text-sm text-neutral-500">Loading…</p>
        )}
        {!loadingSessions && sessions.length === 0 && (
          <p className="px-3 py-2 text-sm text-neutral-500">No chats yet</p>
        )}
        {sessions.map((session) => {
          const active = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              className={`group flex items-center gap-1 rounded-lg ${
                active ? "bg-neutral-800" : "hover:bg-neutral-900"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSession(session.id)}
                className="flex-1 min-w-0 flex items-start gap-2 px-3 py-2.5 text-left text-sm"
              >
                <MessageSquare
                  size={16}
                  className={`shrink-0 mt-0.5 ${active ? "text-emerald-400" : "text-neutral-500"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-neutral-200">{session.title}</span>
                  <span className="block text-[11px] text-neutral-500 mt-0.5">
                    {formatSessionDate(session.created_at)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 mr-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition"
                aria-label="Delete chat"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-800 text-[11px] text-neutral-600 leading-relaxed">
        {footerLabel ?? "Lenny Growth Assistant"}
      </div>
    </aside>
  );
}
