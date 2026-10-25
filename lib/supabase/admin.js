import { createClient } from '@supabase/supabase-js';
// Full-access database client. SERVER ONLY. Never import this into anything a browser can run.
export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
}
