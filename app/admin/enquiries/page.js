import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/admin';

async function mark(fd) {
  'use server';
  const sb = await requireAdmin();
  await sb.from('enquiries').update({ handled: fd.get('handled') === '1' }).eq('id', String(fd.get('id')));
  revalidatePath('/admin/enquiries');
}
async function remove(fd) {
  'use server';
  const sb = await requireAdmin();
  await sb.from('enquiries').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/enquiries');
}

export default async function Enquiries() {
  const sb = await requireAdmin();
  const { data } = await sb.from('enquiries').select('*').order('handled').order('created_at', { ascending: false }).limit(100);
  return (<main style={{ maxWidth: 720, margin: '30px auto', padding: 18 }}><h1>Contact enquiries</h1>
    <p>Messages from the contact form appear here. Check this page regularly.</p>
    {!data?.length && <p>No enquiries yet.</p>}
    {data?.map((e) => (<div key={e.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
      <b>{e.name}</b> (<a href={`mailto:${e.email}`}>{e.email}</a>) {new Date(e.created_at).toLocaleDateString('en-ZA')} {e.handled ? '(done)' : '(new)'}
      <p style={{ whiteSpace: 'pre-line' }}>{e.message}</p>
      <form action={mark} style={{ display: 'inline' }}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="handled" value={e.handled ? '0' : '1'} />
        <button type="submit">{e.handled ? 'Mark as new' : 'Mark as done'}</button></form>{' '}
      <form action={remove} style={{ display: 'inline' }}><input type="hidden" name="id" value={e.id} /><button type="submit">Delete</button></form>
    </div>))}</main>);
}
