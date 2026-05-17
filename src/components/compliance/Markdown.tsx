// Minimal markdown renderer — sufficient for the bundled DOCUMENTATION.md
// (headings, paragraphs, lists, tables, inline code, code fences, bold/italic, links).
// Avoids adding a heavy dependency for a single docs panel.

import { Fragment, type ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (n: ReactNode) => nodes.push(<Fragment key={key++}>{n}</Fragment>);

  const patterns: Array<{ re: RegExp; wrap: (m: RegExpExecArray) => ReactNode }> = [
    { re: /`([^`]+)`/, wrap: (m) => <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">{m[1]}</code> },
    { re: /\*\*([^*]+)\*\*/, wrap: (m) => <strong>{m[1]}</strong> },
    { re: /\*([^*]+)\*/, wrap: (m) => <em>{m[1]}</em> },
    { re: /\[([^\]]+)\]\(([^)]+)\)/, wrap: (m) => <a className="text-primary underline" href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a> },
  ];

  while (i < text.length) {
    let bestIdx = -1;
    let bestMatch: RegExpExecArray | null = null;
    let bestWrap: ((m: RegExpExecArray) => ReactNode) | null = null;
    for (const p of patterns) {
      const m = p.re.exec(text.slice(i));
      if (m && (bestIdx === -1 || m.index < bestIdx)) {
        bestIdx = m.index;
        bestMatch = m;
        bestWrap = p.wrap;
      }
    }
    if (!bestMatch || !bestWrap) {
      push(text.slice(i));
      break;
    }
    if (bestIdx > 0) push(text.slice(i, i + bestIdx));
    push(bestWrap(bestMatch));
    i += bestIdx + bestMatch[0].length;
  }
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre key={key++} className="my-3 overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls =
        level === 1
          ? "mt-6 mb-3 text-2xl font-bold tracking-tight"
          : level === 2
          ? "mt-6 mb-2 text-xl font-semibold tracking-tight"
          : level === 3
          ? "mt-4 mb-2 text-base font-semibold"
          : "mt-3 mb-1 text-sm font-semibold";
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      out.push(<Tag key={key++} className={cls}>{renderInline(h[2])}</Tag>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      out.push(<hr key={key++} className="my-4 border-border" />);
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
      const headerCells = line.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(lines[i].split("|").map((c) => c.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === "") && !(idx === arr.length - 1 && arr[arr.length - 1] === "")));
        i++;
      }
      out.push(
        <div key={key++} className="my-3 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headerCells.map((c, ci) => (
                  <th key={ci} className="px-2 py-1.5 text-left font-semibold">{renderInline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-b border-border/50">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-2 py-1.5 align-top">{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (
        i < lines.length &&
        (ordered ? /^\s*\d+\.\s+/.test(lines[i]) : /^\s*[-*]\s+/.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      out.push(
        <ListTag key={key++} className={`my-2 ${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-6 text-sm`}>
          {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
        </ListTag>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect until blank line)
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|```|[-*]\s|\d+\.\s|---)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(
      <p key={key++} className="my-2 text-sm leading-relaxed text-foreground/85">
        {renderInline(buf.join(" "))}
      </p>,
    );
  }

  return <div className="max-w-none">{out}</div>;
}
