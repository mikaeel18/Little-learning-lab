import { redirect } from 'next/navigation';
import { supabase } from './supabase/server';

// Call this at the top of EVERY admin page and EVERY admin action.
// It checks on the server that the person is logged in AND is an admin.
export async function requireAdmin() {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin/login');
  return sb;
}
