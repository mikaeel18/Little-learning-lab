import { NextResponse } from 'next/server';
import { admin } from '../../../../lib/supabase/admin';
import { clientIp, sourceIsPayfast, itnParamString, itnSignature, serverConfirms, safeEqual } from '../../../../lib/payfast';

export const dynamic = 'force-dynamic';
const reject = (why) => { console.error('PayFast notification rejected:', why); return new NextResponse('Rejected', { status: 400 }); };

// PayFast calls this when a payment changes. Only here is an order ever marked as paid.
export async function POST(req) {
  const raw = await req.text();
  const entries = [...new URLSearchParams(raw).entries()];
  const d = Object.fromEntries(entries);
  const paramString = itnParamString(entries);

  // The four checks PayFast requires, plus the merchant id.
  if (!safeEqual(itnSignature(paramString, process.env.PAYFAST_PASSPHRASE), d.signature || '')) return reject('signature');
  if (!(await sourceIsPayfast(clientIp(req)))) return reject('source ip');
  if (d.merchant_id !== process.env.PAYFAST_MERCHANT_ID) return reject('merchant id');
  if (!/^[0-9a-f-]{36}$/i.test(d.m_payment_id || '')) return reject('order id');

  const sb = admin();
  const { data: order } = await sb.from('orders').select('id, status, total_cents').eq('id', d.m_payment_id).maybeSingle();
  if (!order) return reject('unknown order');
  if (Math.round(parseFloat(d.amount_gross) * 100) !== order.total_cents) return reject('amount mismatch');
  if (!(await serverConfirms(paramString))) return reject('PayFast did not confirm');

  // Same notification twice? Only process it once.
  const eventId = `${d.pf_payment_id}:${d.payment_status}`;
  const { error: dup } = await sb.from('payment_events').insert({ gateway_event_id: eventId, payload: d });
  if (dup) {
    const { data: ev } = await sb.from('payment_events').select('processed_at').eq('gateway_event_id', eventId).maybeSingle();
    if (ev?.processed_at) return new NextResponse('OK');
  }
  if (d.payment_status === 'COMPLETE') {
    await sb.from('orders').update({ status: 'paid', paid_at: new Date().toISOString(), gateway_reference: d.pf_payment_id })
      .eq('id', order.id).in('status', ['pending', 'failed', 'cancelled']);
  } else if (d.payment_status === 'FAILED') {
    await sb.from('orders').update({ status: 'failed' }).eq('id', order.id).eq('status', 'pending');
  } else if (d.payment_status === 'CANCELLED') {
    await sb.from('orders').update({ status: 'cancelled' }).eq('id', order.id).eq('status', 'pending');
  }
  await sb.from('payment_events').update({ processed_at: new Date().toISOString() }).eq('gateway_event_id', eventId);
  return new NextResponse('OK');
}
