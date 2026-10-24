import { redirect } from 'next/navigation';
import { requireAdmin } from '../../../../lib/admin';
import { GRADES, SUBJECTS } from '../../../../lib/curriculum';

const COLLECTIONS = ['Teacher Resources', 'Teacher Admin and Organisation', 'Printable Resources',
  'Extra Hands for Parents', 'Little Lab Science Club', 'Free CAPS and ATP Library'];

async function createProduct(formData) {
  'use server';
  const sb = await requireAdmin();                       // server-side permission check
  const title = String(formData.get('title') || '').trim().slice(0, 200);
  const collection = String(formData.get('collection') || '');
  const rand = Number(formData.get('price'));
  const term = formData.get('term') ? Number(formData.get('term')) : null;
  if (!title || !COLLECTIONS.includes(collection) || !(rand >= 0) || (term && (term < 1 || term > 4)))
    redirect('/admin/products/new?error=1');
  const code = 'LLL-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const { error } = await sb.from('products').insert({
    code, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + code.toLowerCase(),
    title, collection, term,
    product_type: String(formData.get('product_type') || 'Resource').slice(0, 60),
    grade: String(formData.get('grade') || '').slice(0, 40),
    subject: String(formData.get('subject') || '').slice(0, 60),
    description: String(formData.get('description') || '').slice(0, 5000),
    price_cents: Math.round(rand * 100),
  });
  if (error) redirect('/admin/products/new?error=1');
  redirect('/admin');
}

export default async function NewProduct({ searchParams }) {
  await requireAdmin();
  const f = { display: 'block', width: '100%', marginBottom: 12 };
  return (
    <main style={{ maxWidth: 520, margin: '30px auto', padding: 18, fontFamily: 'sans-serif' }}>
      <h1>Add a product</h1>
      {searchParams?.error && <p role="alert">Please check the form and try again.</p>}
      <form action={createProduct}>
        <label>Title<input name="title" required style={f} /></label>
        <label>Collection<select name="collection" style={f}>{COLLECTIONS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Type (worksheet, bundle, planner...)<input name="product_type" style={f} /></label>
        <label>Grade<select name="grade" style={f}><option value="">None</option>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>Subject<select name="subject" style={f}><option value="">None</option>{SUBJECTS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Term (1 to 4)<input name="term" type="number" min="1" max="4" style={f} /></label>
        <label>Price in rand (0 for free)<input name="price" type="number" min="0" step="0.01" required style={f} /></label>
        <label>Description<textarea name="description" rows="5" style={f} /></label>
        <button type="submit">Save as hidden draft</button>
      </form>
    </main>
  );
}
