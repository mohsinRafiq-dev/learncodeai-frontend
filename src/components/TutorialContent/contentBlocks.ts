/**
 * Groups tutorial markdown into renderable blocks.
 *
 * Kept apart from the component so the fence state machine stays out of the
 * JSX, and so it can be exercised without rendering anything.
 */

export type ContentBlock =
  | { kind: "code"; language: string; code: string }
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "paragraph"; text: string }
  | { kind: "spacer" };

export function parseContentBlocks(content: string): ContentBlock[] {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code block. Everything up to the closing fence is taken
    // verbatim -- markdown inside a fence is code, not markup.
    if (line.trimStart().startsWith("```")) {
      flushList();
      const language = line.trim().slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      // An unclosed fence still renders as code rather than swallowing the
      // rest of the tutorial into a paragraph.
      blocks.push({
        kind: "code",
        language: language || "text",
        code: body.join("\n"),
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push({ kind: "heading", level: 3, text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push({ kind: "heading", level: 2, text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
      blocks.push({ kind: "spacer" });
    } else {
      flushList();
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  flushList();
  return blocks;
}
