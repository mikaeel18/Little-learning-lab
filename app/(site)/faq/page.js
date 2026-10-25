import { supabase } from '../../../lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function Faq() {
  const { data } = await supabase().from('faqs').select('*').order('sort');
  return (<section className="w" style={{ maxWidth: 720 }}><h1>Frequently asked questions</h1>
    {data?.length ? data.map((f) => (<details key={f.id} className="note" style={{ marginBottom: 10 }}><summary><b>{f.question}</b></summary><p style={{ whiteSpace: 'pre-line' }}>{f.answer}</p></details>))
      : <p className="note">Questions and answers are coming soon.</p>}</section>);
}
