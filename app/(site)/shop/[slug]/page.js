import { redirect, notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/server';
import { getCart, setCart } from '../../../../lib/cart';
import { rand } from '../../../../lib/curriculum';
import { admin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function addToCart(fd) {
  'use server';
  const id = String(fd.get('id'));
  const { data } = await supabase().from('products').select('id').eq('id', id).eq('status', 'published').maybeSingle();
  if (data) setCart([...getCart(), data.id]);
  redirect('/cart');
}

export default async function Product({ params }) {
  const { data: p } = await supabase().from('products').select('*').eq('slug', params.slug).eq('status', 'published').maybeSingle();
  if (!p) notFound();
  const files = p.price_cents === 0 ? (await admin().from('product_files').select('id, file_name, size_bytes').eq('product_id', p.id)).data : null;
  const row = (k, v) => v ? <tr><td>{k}</td><td>{v}</td></tr> : null;
  return (
    <section className="w two">
      <div className="cover" style={{ minHeight: 260 }}>{p.subject || p.collection}</div>
      <div>
        <h1>{p.title}</h1>
        <p>{p.grade && <span className="tag">{p.grade}</span>}{p.term && <span className="tag">Term {p.term}</span>}<span className="tag">{p.product_type}</span></p>
        <p>{p.description}</p>
        <table><tbody>
          {row('Product code', p.code)}{row('Language', p.language)}{row('File type', p.file_type)}{row('Pages', p.page_count)}
          {row('Included', p.included_contents?.join(', '))}{row('Printing and editing', p.print_info)}
          {row('Licence', p.licence_info || 'For one teacher or family. Not for resale or sharing.')}
        </tbody></table>
        <h2>{rand(p.price_cents)}</h2>
        {p.price_cents > 0
          ? <form action={addToCart}><input type="hidden" name="id" value={p.id} /><button className="btn" type="submit">Add to cart</button></form>
          : (files?.length ? <div>{files.map((f) => <p key={f.id}><a className="btn" href={`/download/${f.id}`}>Download {f.file_name}</a></p>)}</div> : <p className="note">The file for this free resource is being added. Please check back soon.</p>)}
      </div>
    </section>);
}
