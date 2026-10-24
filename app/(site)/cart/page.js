import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase/server';
import { getCart, setCart } from '../../../lib/cart';
import { rand } from '../../../lib/curriculum';

export const dynamic = 'force-dynamic';

async function removeItem(fd) {
  'use server';
  setCart(getCart().filter((id) => id !== String(fd.get('id'))));
  redirect('/cart');
}

export default async function Cart() {
  const ids = getCart();
  const { data } = ids.length ? await supabase().from('products').select('id, title, price_cents').in('id', ids).eq('status', 'published') : { data: [] };
  const total = (data || []).reduce((a, p) => a + p.price_cents, 0);
  return (
    <section className="w">
      <h1>Your cart</h1>
      {data?.length ? (<>
        <table><tbody>
          {data.map((p) => (<tr key={p.id}><td>{p.title}</td><td>{rand(p.price_cents)}</td>
            <td><form action={removeItem}><input type="hidden" name="id" value={p.id} /><button className="btn alt" type="submit">Remove</button></form></td></tr>))}
          <tr><th>Total</th><th>{rand(total)}</th><td /></tr>
        </tbody></table>
        <p className="note">Secure payment is not connected yet. It is added in the payments stage, after your payment account is approved.</p>
        <p><button className="btn" disabled>Checkout (coming soon)</button></p>
      </>) : <p className="note">Your cart is empty. <a href="/shop">Browse the shop</a>.</p>}
    </section>);
}
