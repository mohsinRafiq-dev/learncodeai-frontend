import React from "react";
import { parseContentBlocks } from "./contentBlocks";

/**
 * Renders tutorial markdown.
 *
 * The previous renderer mapped over `content.split("\n")` and handled only
 * headings, list items and `**bold**`. It had no case for fenced code
 * blocks, so a tutorial's code examples rendered as literal text with their
 * fence markers still showing, and inline `code` kept its backticks. That
 * hit the code examples hardest, which are the part of a tutorial most
 * worth reading.
 */

/**
 * Renders `**bold**` and `` `code` `` inside a line of text.
 * Code is matched first so backticks holding markdown characters stay literal.
 */
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <code
          key={key++}
          className="font-mono text-[0.9em] text-cyan-300 bg-[#0f1330] border border-cyan-500/20 rounded px-1.5 py-0.5"
        >
          {m[1]}
        </code>
      );
    } else {
      out.push(
        <strong key={key++} className="text-gray-100 font-semibold">
          {m[2]}
        </strong>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => (
  <div className="my-4 rounded-lg overflow-hidden border border-cyan-500/25 bg-[#0b0f24]">
    <div className="flex items-center justify-between px-4 py-2 bg-[#141a38] border-b border-cyan-500/20">
      <span className="font-mono text-xs text-cyan-400 uppercase tracking-wide">
        {language}
      </span>
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e91e63]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#00e676]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]" />
      </div>
    </div>
    {/* Long lines scroll inside the block instead of stretching the page. */}
    <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
      <code className="font-mono text-gray-200 whitespace-pre">{code}</code>
    </pre>
  </div>
);

const TutorialContent: React.FC<{ content: string }> = ({ content }) => {
  const blocks = React.useMemo(() => parseContentBlocks(content), [content]);

  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "code":
            return <CodeBlock key={i} language={b.language} code={b.code} />;
          case "heading":
            return b.level === 2 ? (
              <h2
                key={i}
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mt-6 mb-3 pb-2 border-b-2 border-purple-500/50"
              >
                {renderInline(b.text)}
              </h2>
            ) : (
              <h3
                key={i}
                className="text-xl font-semibold text-cyan-400 mt-4 mb-2 flex items-center gap-2"
              >
                <span className="text-cyan-500">▸</span>
                <span>{renderInline(b.text)}</span>
              </h3>
            );
          case "list":
            return (
              <ul key={i} className="my-2">
                {b.items.map((item, j) => (
                  <li
                    key={j}
                    className="ml-4 text-gray-300 py-1 hover:text-gray-100"
                  >
                    <span className="text-purple-400 mr-2">●</span>
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "spacer":
            return <div key={i} className="h-3" />;
          case "paragraph":
            return (
              <p key={i} className="text-gray-300 mb-2 leading-relaxed">
                {renderInline(b.text)}
              </p>
            );
        }
      })}
    </>
  );
};

export default TutorialContent;
