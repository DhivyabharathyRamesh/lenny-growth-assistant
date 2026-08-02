# Design — Lenny Growth Assistant

## Design principles

1. **Familiar chat patterns** — layout inspired by ChatGPT/Claude: left history, center conversation, optional right artifact pane.
2. **Focus on readability** — dark theme, generous line height, markdown for assistant replies.
3. **Progressive disclosure** — artifacts stay in a panel until the user opens them; past artifact messages expose a "View artifact" action.
4. **Resilient layout** — flex containers use `min-h-0` and `100dvh` so Chrome correctly sizes scroll regions and iframe previews.

## Information architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar          │ Main chat                    │ Artifact │
│ - New chat       │ - Header                     │ (opt.)   │
│ - Session list   │ - Messages                   │ Preview  │
│ - Delete         │ - Composer                   │          │
│ - Provider foot  │                              │          │
└─────────────────────────────────────────────────────────────┘
```

## Visual language

| Token | Usage |
|-------|--------|
| Background `neutral-950` | App shell |
| Surface `neutral-900` | Assistant bubbles, inputs |
| Accent `emerald-600` | Primary actions, assistant avatar |
| Border `neutral-800` | Separation, subtle depth |
| Text `neutral-100` / `neutral-400` | Primary / secondary copy |

Typography: system UI stack (Inter if available). Assistant content uses Tailwind Typography (`prose prose-invert prose-sm`).

## Interaction flows

### New conversation

1. User clicks **New chat** → local state cleared; no session id until first send.
2. First `POST /chat/` creates session with title from first message prefix.

### Resume conversation

1. User selects session in sidebar → `GET /sessions/{id}`.
2. Messages render in order; artifacts re-open from stored `message.artifact`.

### Artifact generation

1. User message matches artifact skill keywords.
2. Model returns markdown with fenced code; backend extracts artifact string.
3. Panel opens automatically; user can close and reopen via message link.

### Delete session

1. Confirm dialog → `DELETE /sessions/{id}`.
2. If active session deleted, return to empty state.

## Artifact viewer behavior

- **HTML:** Wrapped in minimal document if fragment-only; rendered in sandboxed iframe.
- **Markdown:** Rendered with same markdown pipeline as chat.
- **Detection:** HTML only when content starts with structural tags (`html`, `div`, `!doctype`, etc.), avoiding false positives from `<` in prose.

## Responsive behavior

- **Desktop (lg+):** Three-column layout when artifact is open.
- **Mobile:** Artifact slides in from the right with scrim; chat remains primary.

## Accessibility (baseline)

- Icon buttons include `aria-label`.
- Artifact panel has `aria-label="Artifact viewer"`.
- Keyboard: Enter sends (Shift+Enter for newline in textarea).

## Known limitations

- No streaming indicator beyond loading spinner.
- Session titles are not editable in UI (backend supports title field for future edit).
- Keyword skill router can misfire on ambiguous phrasing — documented in PRD as future semantic router.
