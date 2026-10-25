import { NextResponse } from 'next/server';
import { admin } from '../../../../../../lib/supabase/admin';
import { tokenOk, sha256, clientIp } from '../../../../../../lib/payfast';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f-]{36}$/i;
const MAX_PER_FILE = 20;     // downloads allowed per file per order
const nf = () => new NextResponse('Not found', { status: 404 });

// PAID files. Checks: valid order link, order is PAID, the file belongs to something in this order.
export async function GET(req, { params }) {
  const t = new URL(req.url).searchParams.get('t') || '';
  if (!UUID.test(params.orderId) || !UUID.test(params.fileId)) return nf();
  const sb = admin();
  const { data: order } = await sb.from('orders').select('id, status, guest_token_hash').eq('id', params.orderId).maybeSingle();
  if (!order || order.status !== 'paid' || !tokenOk(t, order.guest_token_hash)) return nf();
  const { data: f } = await sb.from('product_files').select('id, product_id, storage_key, file_name').eq('id', params.fileId).maybeSingle();
  if (!f) return nf();
  const { data: item } = await sb.from('order_items').select('product_id').eq('order_id', order.id).eq('product_id', f.product_id).maybeSingle();
  if (!item) return nf();
  const { count } = await sb.from('downloads').select('id', { count: 'exact', head: true }).eq('order_id', order.id).eq('product_file_id', f.id);
  if (count >= MAX_PER_FILE) return new NextResponse('Download limit reached for this file. Please contact us and we will help.', { status: 429 });
  const { data, error } = await sb.storage.from('product-files').createSignedUrl(f.storage_key, 60, { download: f.file_name });
  if (error || !data?.signedUrl) return new NextResponse('Could not prepare the download. Please try again.', { status: 500 });
  await sb.from('downloads').insert({ order_id: order.id, product_file_id: f.id, ip_hash: sha256(clientIp(req)) });
  return NextResponse.redirect(data.signedUrl, 302);
}
