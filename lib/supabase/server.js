import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Talks to the database as the logged-in person. The database's own rules still apply.
export function supabase() {
  const jar = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(list) { try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {} },
    },
  });
}
