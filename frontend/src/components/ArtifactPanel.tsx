import { FileCode, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isHtmlArtifact, wrapHtmlDocument } from "../lib/artifact";

interface ArtifactPanelProps {
  content: string;
  onClose: () => void;
}

export function ArtifactPanel({ content, onClose }: ArtifactPanelProps) {
  const html = isHtmlArtifact(content);

  return (
    <aside
      className="flex flex-col min-h-0 w-full lg:w-[min(48rem,46vw)] lg:min-w-[22rem] border-l border-neutral-800 bg-neutral-950 shrink-0"
      aria-label="Artifact viewer"
    >
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 font-medium text-sm text-neutral-100">
          <FileCode size={17} className="text-emerald-500" />
          Artifact
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          aria-label="Close artifact panel"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-neutral-900/50">
        {html ? (
          <iframe
            title="Artifact preview"
            srcDoc={wrapHtmlDocument(content)}
            className="flex-1 min-h-0 w-full border-0 bg-white"
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            <div className="prose prose-invert prose-sm max-w-none chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
