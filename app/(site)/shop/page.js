import Link from 'next/link';
import { supabase } from '../../../lib/supabase/server';
import { GRADES, SUBJECTS, rand } from '../../../lib/curriculum';
import { COLLECTIONS } from '../../../lib/collections';

export const dynamic = 'force-dynamic';

export default async function Shop({ searchParams: s }) {
  const q = String(s.q || '').replace(/[%_,()\\]/g, ' ').trim().slice(0, 80);
  let query = supabase().from('products').select('id, slug, title, subject, collection, grade, term, price_cents').eq('status', 'published');
  if (q) query = query.ilike('title', `%${q}%`);
  if (GRADES.includes(s.grade)) query = query.eq('grade', s.grade);
  if (SUBJECTS.includes(s.subject)) query = query.eq('subject', s.subject);
  if (COLLECTIONS.includes(s.collection)) query = query.eq('collection', s.collection);
  if (['1', '2', '3', '4'].includes(s.term)) query = query.eq('term', Number(s.term));
  if (s.price === 'free') query = query.eq('price_cents', 0);
  if (s.price === 'paid') query = query.gt('price_cents', 0);
  query = s.sort === 'lo' ? query.order('price_cents') : s.sort === 'hi' ? query.order('price_cents', { ascending: false }) : query.order('created_at', { ascending: false });
  const { data: items } = await query.limit(60);
  const opts = (list, cur) => list.map((x) => <option key={x} selected={x === cur}>{x}</option>);
  return (
    <section className="w">
      <h1>Shop</h1>
      <form className="filters" method="get">
        <input name="q" placeholder="Search" defaultValue={q} aria-label="Search" />
        <select name="grade" aria-label="Grade"><option value="">All grades</option>{opts(GRADES, s.grade)}</select>
        <select name="subject" aria-label="Subject"><option value="">All subjects</option>{opts(SUBJECTS, s.subject)}</select>
        <select name="collection" aria-label="Collection"><option value="">All collections</option>{opts(COLLECTIONS, s.collection)}</select>
        <select name="term" aria-label="Term"><option value="">Any term</option>{['1', '2', '3', '4'].map((t) => <option key={t} value={t} selected={t === s.term}>Term {t}</option>)}</select>
        <select name="price" aria-label="Price"><option value="">Free and paid</option><option value="free" selected={s.price === 'free'}>Free</option><option value="paid" selected={s.price === 'paid'}>Paid</option></select>
        <select name="sort" aria-label="Sort"><option value="">Newest</option><option value="lo" selected={s.sort === 'lo'}>Price: low to high</option><option value="hi" selected={s.sort === 'hi'}>Price: high to low</option></select>
        <button className="btn" type="submit">Filter</button>
      </form>
      {items?.length ? <div className="grid">{items.map((p) => (
        <Link key={p.id} className="card" href={`/shop/${p.slug}`}>
          <div className="cover">{p.subject || p.collection}</div><b>{p.title}</b>
          <div>{p.grade && <span className="tag">{p.grade}</span>}{p.term && <span className="tag">Term {p.term}</span>}</div><b>{rand(p.price_cents)}</b>
        </Link>))}</div>
        : <p className="note">Nothing found. Try clearing a filter, or check back soon for new resources.</p>}
    </section>);
}
