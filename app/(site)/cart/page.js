import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase/server';
import { admin } from '../../../lib/supabase/admin';
import { getCart, setCart } from '../../../lib/cart';
import { rand } from '../../../lib/curriculum';
import { sha256, newToken } from '../../../lib/payfast';

export const dynamic = 'force-dynamic';

async function removeItem(fd) {
  'use server';
  setCart(getCart().filter((id) => id !== String(fd.get('id'))));
  redirect('/cart');
}

// Builds the order from the PRICES IN THE DATABASE (never from the browser), then sends the buyer to pay.
async function checkout(fd) {
  'use server';
  const email = String(fd.get('email') || '').trim().toLowerCase().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect('/cart?error=email');
  const ids = getCart();
  if (!ids.length) redirect('/cart');
  const sb = admin();
  const since = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await sb.from('orders').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since);
  if (count >= 10) redirect('/cart?error=many');
  const { data: items } = await sb.from('products').select('id, price_cents').in('id', ids).eq('status', 'published').gt('price_cents', 0);
  if (!items?.length) redirect('/cart');
  const token = newToken();
  const { data: order, error } = await sb.from('orders')
    .insert({ email, total_cents: items.reduce((a, p) => a + p.price_cents, 0), guest_token_hash: sha256(token) }).select('id').single();
  if (error) redirect('/cart?error=save');
  const { error: e2 } = await sb.from('order_items').insert(items.map((p) => ({ order_id: order.id, product_id: p.id, price_cents: p.price_cents })));
  if (e2) { await sb.from('orders').delete().eq('id', order.id); redirect('/cart?error=save'); }
  redirect(`/pay/${order.id}?t=${token}`);
}

const MSG = { email: 'Please enter a valid email address.', many: 'Too many orders from this email recently. Please try again later.', save: 'Sorry, something went wrong. Please try again.' };

export default async function Cart({ searchParams: s }) {
  const ids = getCart();
  const { data } = ids.length ? await supabase().from('products').select('id, title, price_cents').in('id', ids).eq('status', 'published') : { data: [] };
  const total = (data || []).reduce((a, p) => a + p.price_cents, 0);
  return (
    <section className="w">
      <h1>Your cart</h1>
      {s.error && <p className="note" role="alert">{MSG[s.error] || MSG.save}</p>}
      {data?.length ? (<>
        <table><tbody>
          {data.map((p) => (<tr key={p.id}><td>{p.title}</td><td>{rand(p.price_cents)}</td>
            <td><form action={removeItem}><input type="hidden" name="id" value={p.id} /><button className="btn alt" type="submit">Remove</button></form></td></tr>))}
          <tr><th>Total</th><th>{rand(total)}</th><td /></tr>
        </tbody></table>
        <form action={checkout} style={{ marginTop: 18, maxWidth: 420 }}>
          <label>Your email (your files are linked to it)
            <input name="email" type="email" required maxLength={200} style={{ display: 'block', width: '100%', margin: '6px 0 14px' }} /></label>
          <button className="btn" type="submit">Pay securely with PayFast</button>
        </form>
        <p style={{ fontSize: '.9rem' }}>You will pay on PayFast’s secure page. We never see or store your card details.</p>
      </>) : <p className="note">Your cart is empty. <a href="/shop">Browse the shop</a>.</p>}
    </section>);
}
