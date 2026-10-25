import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/server';
import { Paragraphs } from '../../../../lib/text';
import { POLICY_TITLES, POLICY_DEFAULTS } from '../../../../lib/policies';
export const dynamic = 'force-dynamic';
export default async function Policy({ params }) {
  if (!POLICY_TITLES[params.slug]) notFound();
  const { data } = await supabase().from('site_text').select('value').eq('key', params.slug).maybeSingle();
  return (<section className="w" style={{ maxWidth: 720 }}><h1>{POLICY_TITLES[params.slug]}</h1>
    <Paragraphs text={data?.value || POLICY_DEFAULTS[params.slug]} /></section>);
}
