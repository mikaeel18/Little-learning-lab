import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase/server';

async function login(formData) {
  'use server';
  const { error } = await supabase().auth.signInWithPassword({
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
  });
  if (error) redirect('/admin/login?error=1');
  redirect('/admin');
}

export default function Login({ searchParams }) {
  return (
    <main style={{ maxWidth: 380, margin: '60px auto', padding: 18, fontFamily: 'sans-serif' }}>
      <h1>Admin log in</h1>
      {searchParams?.error && <p role="alert">That email or password did not work.</p>}
      <form action={login}>
        <p><label>Email<br /><input name="email" type="email" required style={{ width: '100%' }} /></label></p>
        <p><label>Password<br /><input name="password" type="password" required style={{ width: '100%' }} /></label></p>
        <button type="submit">Log in</button>
      </form>
    </main>
  );
}
