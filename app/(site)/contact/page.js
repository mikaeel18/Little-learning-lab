import { redirect } from 'next/navigation';
import { admin } from '../../../lib/supabase/admin';

async function send(fd) {
  'use server';
  if (fd.get('website')) redirect('/contact?sent=1');            // hidden trap field: only robots fill it in
  const name = String(fd.get('name') || '').trim().slice(0, 100);
  const email = String(fd.get('email') || '').trim().toLowerCase().slice(0, 200);
  const message = String(fd.get('message') || '').trim().slice(0, 3000);
  if (name.length < 2 || message.length < 10 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect('/contact?error=form');
  if ((message.match(/https?:\/\//g) || []).length > 2) redirect('/contact?error=form');
  const sb = admin();
  const since = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since);
  if (count >= 3) redirect('/contact?error=many');
  const { error } = await sb.from('enquiries').insert({ name, email, message });
  if (error) redirect('/contact?error=save');
  redirect('/contact?sent=1');
}

const MSG = { form: 'Please fill in your name, a valid email and a message.', many: 'You have sent several messages recently. Please try again later.', save: 'Sorry, that did not send. Please email us instead.' };

export default function Contact({ searchParams: s }) {
  const f = { display: 'block', width: '100%', marginBottom: 12 };
  return (<section className="w" style={{ maxWidth: 620 }}><h1>Contact</h1>
    <p>Email <a href="mailto:nuriya.jaffar@gmail.com">nuriya.jaffar@gmail.com</a> or message us on <a href="https://wa.me/27725384804">WhatsApp</a>.</p>
    {s.sent && <p className="note" role="status">Thank you. Your message was sent.</p>}
    {s.error && <p className="note" role="alert">{MSG[s.error] || MSG.form}</p>}
    <form action={send}>
      <label>Your name<input name="name" required maxLength={100} style={f} /></label>
      <label>Your email<input name="email" type="email" required maxLength={200} style={f} /></label>
      <label>Message<textarea name="message" rows="6" required minLength={10} maxLength={3000} style={f} /></label>
      <div style={{ position: 'absolute', left: -9999 }} aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="btn" type="submit">Send message</button>
    </form></section>);
}
