"use client";

import type { ReactNode } from "react";

type Block =
  | { kind: "paragraph" | "ordered" | "unordered"; lines: string[] }
  | { kind: "heading"; level: number; text: string }
  | { kind: "rule" };

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-primary-50 px-1 py-0.5 text-[0.92em]">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

/** Safely format common Markdown without rendering model output as HTML. */
export function MarkdownContent({ content }: { content: string }) {
  // Some models omit line breaks before headings or numbered steps.
  const normalized = content
    .replace(/(#{1,3}\s+)/g, "\n$1")
    .replace(/([.!?])\s+(\d+[.)]\s+)/g, "$1\n$2");
  const blocks: Block[] = [];

  for (const raw of normalized.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^(---+|\*\*\*+|___+)$/.test(line)) {
      blocks.push({ kind: "rule" });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ordered") last.lines.push(ordered[1]);
      else blocks.push({ kind: "ordered", lines: [ordered[1]] });
      continue;
    }
    if (/^[-*•]\s+/.test(line)) {
      const item = line.replace(/^[-*•]\s+/, "");
      const last = blocks[blocks.length - 1];
      if (last?.kind === "unordered") last.lines.push(item);
      else blocks.push({ kind: "unordered", lines: [item] });
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last?.kind === "paragraph") last.lines.push(line);
    else blocks.push({ kind: "paragraph", lines: [line] });
  }

  return (
    <div className="space-y-2 break-words [overflow-wrap:anywhere]">
      {blocks.map((block, index) => {
        if (block.kind === "rule") return <hr key={index} className="border-border-soft" />;
        if (block.kind === "heading") {
          const Heading = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          return <Heading key={index} className="font-semibold text-heading">{inline(block.text)}</Heading>;
        }
        if (block.kind === "ordered" || block.kind === "unordered") {
          const List = block.kind === "ordered" ? "ol" : "ul";
          const style = block.kind === "ordered" ? "list-decimal" : "list-disc";
          return (
            <List key={index} className={`${style} space-y-0.5 pl-5`}>
              {block.lines.map((line, itemIndex) => <li key={itemIndex}>{inline(line)}</li>)}
            </List>
          );
        }
        return <p key={index}>{inline(block.lines.join(" "))}</p>;
      })}
    </div>
  );
}
