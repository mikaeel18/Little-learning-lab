// Shows plain text as paragraphs. React escapes the text, so it cannot inject code.
export function Paragraphs({ text }) {
  return String(text || '').split(/\n\s*\n/).filter(Boolean)
    .map((para, i) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{para}</p>);
}
