import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/admin';
import { POLICY_DEFAULTS } from '../../../lib/policies';

const FIELDS = [['home_intro', 'Home page introduction'], ['about_me', 'About Me page'], ['privacy', 'Privacy Policy (draft)'], ['terms', 'Terms and Conditions (draft)'], ['refunds', 'Digital Product and Refund Policy (draft)']];

async function saveText(fd) {
  'use server';
  const sb = await requireAdmin();
  const rows = FIELDS.map(([key]) => ({ key, value: String(fd.get(key) || '').slice(0, 8000) }));
  await sb.from('site_text').upsert(rows);
  revalidatePath('/admin/text');
}

export default async function Text() {
  const sb = await requireAdmin();
  const { data } = await sb.from('site_text').select('key, value');
  const v = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return (
    <main style={{ maxWidth: 680, margin: '30px auto', padding: 18 }}>
      <h1>Website text</h1>
      <form action={saveText}>
        {FIELDS.map(([key, label]) => (
          <label key={key}>{label}
            <textarea name={key} rows={POLICY_DEFAULTS[key] ? 16 : 7} defaultValue={v[key] ?? POLICY_DEFAULTS[key] ?? ''} style={{ display: 'block', width: '100%', marginBottom: 14 }} />
          </label>
        ))}
        <button type="submit">Save text</button>
      </form>
    </main>
  );
}
