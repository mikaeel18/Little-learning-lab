import { supabase } from '../../../lib/supabase/server';
import { Paragraphs } from '../../../lib/text';
import { ABOUT_TITLE, ABOUT_DEFAULT } from '../../../lib/about';
export const dynamic = 'force-dynamic';
export default async function About() {
  const { data } = await supabase().from('site_text').select('value').eq('key', 'about_me').maybeSingle();
  return (
    <section className="w" style={{ maxWidth: 900 }}>
      <h1>{ABOUT_TITLE}</h1>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <img src="/nuriya.jpg" alt="Nuriya Jaffar, founder of Little Lab Learning" width="260" height="260"
          style={{ width: 260, maxWidth: '100%', height: 'auto', borderRadius: 28, border: '4px solid var(--lav)' }} />
        <div style={{ flex: '1 1 320px', minWidth: 0 }}><Paragraphs text={data?.value || ABOUT_DEFAULT} /></div>
      </div>
    </section>);
}
