import { notFound, redirect } from 'next/navigation';
import { admin } from '../../../../lib/supabase/admin';
import { siteUrl, processUrl, checkoutSignature, tokenOk } from '../../../../lib/payfast';

export const dynamic = 'force-dynamic';

export default async function Pay({ params, searchParams }) {
  const t = String(searchParams.t || '');
  const sb = admin();
  const { data: order } = await sb.from('orders').select('id, email, status, total_cents, guest_token_hash').eq('id', params.orderId).maybeSingle();
  if (!order || !tokenOk(t, order.guest_token_hash)) notFound();
  if (order.status === 'paid') redirect(`/order/${order.id}?t=${t}`);
  const site = siteUrl();
  if (!site || !process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY)
    return <section className="w"><p className="note">Payment is not set up yet. Please contact us.</p></section>;
  const { data: items } = await sb.from('order_items').select('products(title)').eq('order_id', order.id);
  const titles = (items || []).map((i) => i.products?.title).filter(Boolean);
  // The ORDER of these fields matters for the signature.
  const fields = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${site}/api/payfast/return?o=${order.id}&t=${t}`,
    cancel_url: `${site}/order/${order.id}?t=${t}&cancelled=1`,
    notify_url: `${site}/api/payfast/notify`,
    email_address: order.email,
    m_payment_id: order.id,
    amount: (order.total_cents / 100).toFixed(2),
    item_name: (titles.length === 1 ? titles[0] : `Little Lab Learning order (${titles.length} items)`).slice(0, 100),
  };
  const signature = checkoutSignature(fields, process.env.PAYFAST_PASSPHRASE);
  return (
    <section className="w" style={{ maxWidth: 560 }}>
      <h1>Ready to pay</h1>
      <p>{titles.join(', ')}</p>
      <p><b>Total: R{fields.amount}</b></p>
      {process.env.PAYFAST_MODE !== 'live' && <p className="note">Practice mode: no real money is taken.</p>}
      <form action={processUrl()} method="post">
        {Object.entries({ ...fields, signature }).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <button className="btn" type="submit">Continue to PayFast</button>
      </form>
    </section>);
}
