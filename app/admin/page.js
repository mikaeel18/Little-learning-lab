import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../lib/admin';

async function togglePublish(formData) {
  'use server';
  const sb = await requireAdmin();
  const next = formData.get('status') === 'published' ? 'draft' : 'published';
  await sb.from('products').update({ status: next }).eq('id', String(formData.get('id')));
  revalidatePath('/admin');
}

export default async function Admin() {
  const sb = await requireAdmin();
  const { data: products } = await sb.from('products')
    .select('id, code, title, price_cents, status').order('created_at', { ascending: false });
  return (
    <main style={{ maxWidth: 800, margin: '30px auto', padding: 18, fontFamily: 'sans-serif' }}>
      <h1>Your products</h1>
      <p><a href="/admin/products/new">Add a product</a></p>
      {!products?.length && <p>No products yet. Add your first one.</p>}
      <table style={{ width: '100%' }}><tbody>
        {products?.map((p) => (
          <tr key={p.id}>
            <td>{p.code}</td><td><a href={`/admin/products/${p.id}`}>{p.title}</a></td>
            <td>{p.price_cents ? 'R' + (p.price_cents / 100).toFixed(2) : 'Free'}</td>
            <td>
              <form action={togglePublish}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value={p.status} />
                <button type="submit">{p.status === 'published' ? 'Published (click to hide)' : 'Hidden (click to publish)'}</button>
              </form>
            </td>
          </tr>
        ))}
      </tbody></table>
    </main>
  );
}
