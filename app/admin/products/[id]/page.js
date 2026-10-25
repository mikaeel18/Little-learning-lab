import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { requireAdmin } from '../../../../lib/admin';
import { GRADES, SUBJECTS } from '../../../../lib/curriculum';
import { COLLECTIONS } from '../../../../lib/collections';
import { putFile, deleteFile } from '../../../../lib/storage';

const MAX = 25 * 1024 * 1024;
const here = (id, q) => `/admin/products/${id}?${q}`;

async function save(fd) {
  'use server';
  const sb = await requireAdmin();
  const id = String(fd.get('id'));
  const title = String(fd.get('title') || '').trim().slice(0, 200);
  const collection = String(fd.get('collection') || '');
  const rand = Number(fd.get('price'));
  const term = fd.get('term') ? Number(fd.get('term')) : null;
  if (!title || !COLLECTIONS.includes(collection) || !(rand >= 0) || (term && (term < 1 || term > 4))) redirect(here(id, 'error=form'));
  const { error } = await sb.from('products').update({
    title, collection, term, price_cents: Math.round(rand * 100),
    product_type: String(fd.get('product_type') || '').slice(0, 60),
    grade: String(fd.get('grade') || '').slice(0, 40),
    subject: String(fd.get('subject') || '').slice(0, 60),
    description: String(fd.get('description') || '').slice(0, 5000),
    featured: fd.get('featured') === 'on',
  }).eq('id', id);
  if (error) redirect(here(id, 'error=form'));
  revalidatePath('/admin');
  redirect(here(id, 'saved=1'));
}

async function upload(fd) {
  'use server';
  const sb = await requireAdmin();
  const id = String(fd.get('id'));
  const file = fd.get('file');
  if (!file || !file.size || file.size > MAX) redirect(here(id, 'error=size'));
  const name = file.name.toLowerCase();
  const ext = name.endsWith('.pdf') ? 'pdf' : name.endsWith('.zip') ? 'zip' : null;
  if (!ext) redirect(here(id, 'error=type'));
  const buf = Buffer.from(await file.arrayBuffer());
  // Check the file's real contents, not just its name.
  const real = ext === 'pdf' ? buf.subarray(0, 4).toString() === '%PDF' : buf.subarray(0, 2).toString() === 'PK';
  if (!real) redirect(here(id, 'error=type'));
  const safe = name.replace(/[^a-z0-9._-]/g, '_').slice(-80);
  const key = `products/${id}/${randomUUID()}-${safe}`;
  const up = await putFile(sb, key, buf, ext === 'pdf' ? 'application/pdf' : 'application/zip');
  if (up.error) redirect(here(id, 'error=save'));
  const { error } = await sb.from('product_files').insert({ product_id: id, storage_key: key, file_name: safe, size_bytes: file.size });
  if (error) { await deleteFile(sb, key); redirect(here(id, 'error=save')); }
  revalidatePath(`/admin/products/${id}`);
  redirect(here(id, 'uploaded=1'));
}

async function removeFile(fd) {
  'use server';
  const sb = await requireAdmin();
  const id = String(fd.get('id'));
  const { data: f } = await sb.from('product_files').select('id, storage_key').eq('id', String(fd.get('file_id'))).single();
  if (f) { await deleteFile(sb, f.storage_key); await sb.from('product_files').delete().eq('id', f.id); }
  revalidatePath(`/admin/products/${id}`);
  redirect(here(id, 'removed=1'));
}

async function removeProduct(fd) {
  'use server';
  const sb = await requireAdmin();
  const id = String(fd.get('id'));
  if (fd.get('sure') !== 'on') redirect(here(id, 'error=confirm'));
  const { data: files } = await sb.from('product_files').select('storage_key').eq('product_id', id);
  for (const f of files || []) await deleteFile(sb, f.storage_key);
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) redirect(here(id, 'error=orders'));   // products that were already sold cannot be deleted: hide them instead
  revalidatePath('/admin');
  redirect('/admin');
}

const MSG = { form: 'Please check the form.', size: 'Choose a file up to 25 MB.', type: 'Only real PDF or ZIP files are allowed.',
  save: 'Could not save the file. Try again.', confirm: 'Tick the box to confirm deleting.',
  orders: 'This product has been ordered, so it cannot be deleted. Hide it instead.' };

export default async function Edit({ params, searchParams }) {
  const sb = await requireAdmin();
  const { data: p } = await sb.from('products').select('*').eq('id', params.id).single();
  if (!p) notFound();
  const { data: files } = await sb.from('product_files').select('id, file_name, size_bytes').eq('product_id', p.id);
  const f = { display: 'block', width: '100%', marginBottom: 12 };
  return (
    <main style={{ maxWidth: 560, margin: '30px auto', padding: 18, fontFamily: 'sans-serif' }}>
      <p><a href="/admin">Back to products</a></p>
      <h1>{p.title}</h1>
      {searchParams?.error && <p role="alert">{MSG[searchParams.error] || 'Something went wrong.'}</p>}
      {(searchParams?.saved || searchParams?.uploaded || searchParams?.removed) && <p role="status">Done.</p>}
      <form action={save}>
        <input type="hidden" name="id" value={p.id} />
        <label>Title<input name="title" defaultValue={p.title} required style={f} /></label>
        <label>Collection<select name="collection" defaultValue={p.collection} style={f}>{COLLECTIONS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Type<input name="product_type" defaultValue={p.product_type} style={f} /></label>
        <label>Grade<select name="grade" defaultValue={p.grade || ''} style={f}><option value="">None</option>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
        <label>Subject<select name="subject" defaultValue={p.subject || ''} style={f}><option value="">None</option>{SUBJECTS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Term (1 to 4)<input name="term" type="number" min="1" max="4" defaultValue={p.term || ''} style={f} /></label>
        <label>Price in rand (0 for free)<input name="price" type="number" min="0" step="0.01" defaultValue={(p.price_cents / 100).toFixed(2)} required style={f} /></label>
        <label>Description<textarea name="description" rows="5" defaultValue={p.description} style={f} /></label>
        <label><input type="checkbox" name="featured" defaultChecked={p.featured} /> Show as a featured product</label>
        <p><button type="submit">Save changes</button></p>
      </form>
      <h2>Downloadable files</h2>
      {!files?.length && <p>No files yet. Customers cannot receive anything until you upload one.</p>}
      {files?.map((x) => (
        <form key={x.id} action={removeFile}>
          <input type="hidden" name="id" value={p.id} /><input type="hidden" name="file_id" value={x.id} />
          {x.file_name} ({(x.size_bytes / 1048576).toFixed(1)} MB) <button type="submit">Remove</button>
        </form>
      ))}
      <form action={upload} encType="multipart/form-data">
        <input type="hidden" name="id" value={p.id} />
        <p><input type="file" name="file" accept=".pdf,.zip" required /> <button type="submit">Upload PDF or ZIP</button></p>
      </form>
      <h2>Delete this product</h2>
      <form action={removeProduct}>
        <input type="hidden" name="id" value={p.id} />
        <label><input type="checkbox" name="sure" /> Yes, delete this product and its files</label>
        <p><button type="submit">Delete product</button></p>
      </form>
    </main>
  );
}
