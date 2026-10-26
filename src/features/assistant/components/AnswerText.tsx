import { Fragment, type ReactNode } from 'react';

/**
 * An answer from the assistant, laid out: paragraphs, bullet and numbered
 * lists, small tables, bold text. The model writes a little Markdown; this
 * reads just that much of it and builds ordinary elements, so nothing in an
 * answer is ever treated as HTML.
 */

type Block =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbers'; items: string[] }
  | { kind: 'table'; rows: string[][] };

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const last = () => blocks[blocks.length - 1];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      blocks.push({ kind: 'paragraph', lines: [] });
      continue;
    }
    const heading = HEADING.exec(line);
    const bullet = BULLET.exec(line);
    const number = NUMBER.exec(line);
    const top = last();

    if (heading) blocks.push({ kind: 'heading', text: heading[1]! });
    else if (line.trim().startsWith('|')) {
      if (TABLE_RULE.test(line)) continue;
      if (top?.kind === 'table') top.rows.push(cells(line));
      else blocks.push({ kind: 'table', rows: [cells(line)] });
    } else if (bullet) {
      if (top?.kind === 'bullets') top.items.push(bullet[1]!);
      else blocks.push({ kind: 'bullets', items: [bullet[1]!] });
    } else if (number) {
      if (top?.kind === 'numbers') top.items.push(number[1]!);
      else blocks.push({ kind: 'numbers', items: [number[1]!] });
    } else if (top?.kind === 'paragraph') top.lines.push(line);
    else blocks.push({ kind: 'paragraph', lines: [line] });
  }
  return blocks.filter((block) => block.kind !== 'paragraph' || block.lines.length > 0);
}

/** **bold** and `code` inside a line. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="rounded bg-slate-100 px-1 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function AnswerText({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">
      {parse(text).map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <p key={index} className="font-semibold text-slate-900">
                {inline(block.text)}
              </p>
            );
          case 'bullets':
            return (
              <ul key={index} className="list-disc space-y-1 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
                ))}
              </ul>
            );
          case 'numbers':
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
                ))}
              </ol>
            );
          case 'table': {
            const [head, ...body] = block.rows;
            return (
              <div key={index} className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-xs">
                  {head && (
                    <thead className="bg-slate-50 font-semibold text-slate-600">
                      <tr>
                        {head.map((cell, cellIndex) => (
                          <th key={cellIndex} className="px-3 py-2 whitespace-nowrap">
                            {inline(cell)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-slate-100">
                    {body.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2">
                            {inline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return (
              <p key={index}>
                {block.lines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {inline(line)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
