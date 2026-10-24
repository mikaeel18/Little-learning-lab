import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/admin';

async function addFaq(fd) {
  'use server';
  const sb = await requireAdmin();
  const question = String(fd.get('question') || '').trim().slice(0, 300);
  const answer = String(fd.get('answer') || '').trim().slice(0, 3000);
  if (!question || !answer) return;
  await sb.from('faqs').insert({ question, answer, sort: Number(fd.get('sort')) || 0 });
  revalidatePath('/admin/faqs');
}
async function removeFaq(fd) {
  'use server';
  const sb = await requireAdmin();
  await sb.from('faqs').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/faqs');
}

export default async function Faqs() {
  const sb = await requireAdmin();
  const { data } = await sb.from('faqs').select('*').order('sort');
  const f = { display: 'block', width: '100%', marginBottom: 10 };
  return (
    <main style={{ maxWidth: 680, margin: '30px auto', padding: 18 }}>
      <h1>FAQs</h1>
      {data?.map((x) => (
        <form key={x.id} action={removeFaq} style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
          <input type="hidden" name="id" value={x.id} />
          <b>{x.question}</b><br />{x.answer}<br /><button type="submit">Delete</button>
        </form>
      ))}
      <h2>Add a question</h2>
      <form action={addFaq}>
        <label>Question<input name="question" required style={f} /></label>
        <label>Answer<textarea name="answer" rows="4" required style={f} /></label>
        <label>Order (1 shows first)<input name="sort" type="number" style={f} /></label>
        <button type="submit">Add FAQ</button>
      </form>
    </main>
  );
}
