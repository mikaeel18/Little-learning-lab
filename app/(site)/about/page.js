import { supabase } from '../../../lib/supabase/server';
import { Paragraphs } from '../../../lib/text';
export const dynamic = 'force-dynamic';
export default async function About() {
  const { data } = await supabase().from('site_text').select('value').eq('key', 'about_me').maybeSingle();
  return (<section className="w" style={{ maxWidth: 720 }}><h1>About me</h1>
    <Paragraphs text={data?.value || 'Hi, I’m Nuriya Jaffar, a qualified Intermediate Phase teacher with a Bachelor of Education degree. I create resources that give teachers back their time and help parents support learning at home.'} /></section>);
}
