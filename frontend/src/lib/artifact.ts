/** Heuristic: treat as HTML when it looks like a document or block element, not arbitrary `<`. */
export function isHtmlArtifact(content: string): boolean {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("<")) return false;

  const head = trimmed.slice(0, 120).toLowerCase();
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<head") ||
    head.startsWith("<body") ||
    head.startsWith("<div") ||
    head.startsWith("<section") ||
    head.startsWith("<article") ||
    head.startsWith("<style")
  );
}

export function wrapHtmlDocument(fragment: string): string {
  const trimmed = fragment.trim();
  if (trimmed.toLowerCase().startsWith("<!doctype") || trimmed.toLowerCase().startsWith("<html")) {
    return trimmed;
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Artifact</title>
</head>
<body style="margin:0;padding:16px;font-family:system-ui,sans-serif;">
${trimmed}
</body>
</html>`;
}
