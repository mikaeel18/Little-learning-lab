import { notFound } from 'next/navigation';
import { admin } from '../../../../lib/supabase/admin';
import { tokenOk } from '../../../../lib/payfast';

export const dynamic = 'force-dynamic';

export default async function Order({ params, searchParams }) {
  const t = String(searchParams.t || '');
  const sb = admin();
  const { data: order } = await sb.from('orders').select('id, email, status, total_cents, guest_token_hash').eq('id', params.orderId).maybeSingle();
  if (!order || !tokenOk(t, order.guest_token_hash)) notFound();
  const { data: items } = await sb.from('order_items').select('product_id, products(title)').eq('order_id', order.id);
  const ids = (items || []).map((i) => i.product_id);
  const { data: files } = order.status === 'paid' && ids.length
    ? await sb.from('product_files').select('id, product_id, file_name, size_bytes').in('product_id', ids) : { data: [] };
  return (
    <section className="w" style={{ maxWidth: 680 }}>
      <h1>Your order</h1>
      {order.status === 'paid' ? (<>
        <p className="note"><b>Payment confirmed. Thank you!</b> Your files are below.</p>
        {items?.map((i) => (
          <div key={i.product_id} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{i.products?.title}</h2>
            {files?.filter((f) => f.product_id === i.product_id).map((f) => (
              <p key={f.id}><a className="btn" href={`/download/order/${order.id}/${f.id}?t=${t}`}>Download {f.file_name}</a></p>))}
          </div>))}
        <p className="note">Please save or bookmark this page. It is your link to your files.</p>
      </>) : (<>
        {searchParams.cancelled && <p className="note">Payment was cancelled. You have not been charged.</p>}
        <p>{order.status === 'pending' ? 'We have not received payment confirmation yet. If you have just paid, wait a moment and refresh this page.' : `This order is ${order.status}.`}</p>
        <p><a className="btn alt" href={`/order/${order.id}?t=${t}`}>Refresh</a>{' '}
          {order.status === 'pending' && <a className="btn" href={`/pay/${order.id}?t=${t}`}>Pay now</a>}</p>
      </>)}
    </section>);
}
