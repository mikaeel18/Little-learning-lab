// Shows plain text as paragraphs. Lines starting with "## " become headings.
// React escapes the text, so it cannot inject code.
export function Paragraphs({ text }) {
  return String(text || '').split(/\n\s*\n/).filter(Boolean).map((para, i) =>
    para.startsWith('## ')
      ? <h2 key={i}>{para.slice(3)}</h2>
      : <p key={i} style={{ whiteSpace: 'pre-line' }}>{para}</p>);
}
