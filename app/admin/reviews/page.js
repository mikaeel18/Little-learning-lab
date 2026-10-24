import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/admin';

async function setApproved(fd) {
  'use server';
  const sb = await requireAdmin();
  await sb.from('reviews').update({ approved: fd.get('approve') === '1' }).eq('id', String(fd.get('id')));
  revalidatePath('/admin/reviews');
}
async function removeReview(fd) {
  'use server';
  const sb = await requireAdmin();
  await sb.from('reviews').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/reviews');
}

export default async function Reviews() {
  const sb = await requireAdmin();
  const { data } = await sb.from('reviews')
    .select('id, rating, body, approved, verified_purchase, created_at, products(title)')
    .order('approved').order('created_at', { ascending: false });
  return (
    <main style={{ maxWidth: 760, margin: '30px auto', padding: 18 }}>
      <h1>Reviews</h1>
      <p>New reviews stay hidden until you approve them.</p>
      {!data?.length && <p>No reviews yet. They appear here after customers submit them.</p>}
      {data?.map((r) => (
        <div key={r.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
          <b>{r.products?.title}</b>: {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
          {r.verified_purchase ? ' (verified purchase)' : ''} {r.approved ? '(shown on site)' : '(hidden)'}
          <p>{r.body}</p>
          <form action={setApproved} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="approve" value={r.approved ? '0' : '1'} />
            <button type="submit">{r.approved ? 'Hide' : 'Approve'}</button>
          </form>{' '}
          <form action={removeReview} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={r.id} /><button type="submit">Delete</button>
          </form>
        </div>
      ))}
    </main>
  );
}
