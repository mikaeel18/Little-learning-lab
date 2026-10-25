import Link from 'next/link';
import { supabase } from '../../lib/supabase/server';
import { GRADES, rand } from '../../lib/curriculum';

export const dynamic = 'force-dynamic';
const Card = ({ p }) => (
  <Link className="card" href={`/shop/${p.slug}`}>
    <div className="cover">{p.subject || p.collection}</div><b>{p.title}</b>
    <div>{p.grade && <span className="tag">{p.grade}</span>}{p.term && <span className="tag">Term {p.term}</span>}</div>
    <b>{rand(p.price_cents)}</b>
  </Link>);

export default async function Home() {
  const sb = supabase();
  const cols = 'id, slug, title, subject, collection, grade, term, price_cents';
  const { data: featured } = await sb.from('products').select(cols).eq('status', 'published').eq('featured', true).limit(4);
  const { data: fresh } = await sb.from('products').select(cols).eq('status', 'published').order('created_at', { ascending: false }).limit(4);
  const { data: text } = await sb.from('site_text').select('value').eq('key', 'home_intro').maybeSingle();
  const { data: reviews } = await sb.from('reviews').select('id, rating, body, products(title)').eq('approved', true).limit(3);
  return (<>
    <div className="hero"><div className="w hero-in"><div>
      <h1>Little Lab Learning</h1><p><b>Where every lesson sparks a little wonder.</b></p>
      <p>{text?.value || 'Ready-to-use resources for South African teachers and parents, Grade R to Grade 7.'}</p>
      <p><Link className="btn" href="/shop">Browse resources</Link> <Link className="btn alt" href="/shop?price=free">Free downloads</Link></p>
    </div><img className="hero-logo" src="/logo.jpg" alt="Little Lab Learning logo: a smiling science flask" width="320" height="320" /></div></div>
    {!!featured?.length && <section className="w"><h2>Featured</h2><div className="grid">{featured.map((p) => <Card key={p.id} p={p} />)}</div></section>}
    <section className="w"><h2>New arrivals</h2>
      {fresh?.length ? <div className="grid">{fresh.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="note">New resources are coming soon.</p>}
    </section>
    <section className="w"><h2>Browse by grade</h2><div className="chips">
      {GRADES.filter((g) => g !== 'All grades').map((g) => <Link key={g} className="chip" href={`/shop?grade=${encodeURIComponent(g)}`}>{g}</Link>)}
    </div></section>
    <section className="w"><h2>What customers say</h2>
      {reviews?.length ? reviews.map((r) => <p key={r.id} className="note">{'★'.repeat(r.rating)} {r.body} <i>({r.products?.title})</i></p>)
        : <p className="note">No reviews yet. They appear here after customers buy and rate a resource.</p>}
    </section>
  </>);
}
