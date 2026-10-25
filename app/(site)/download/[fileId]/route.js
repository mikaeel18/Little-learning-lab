import { NextResponse } from 'next/server';
import { admin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f-]{36}$/i;
const notFound = () => new NextResponse('Not found', { status: 404 });

// FREE products only. Makes a link that works for 60 seconds, then sends the visitor to it.
export async function GET(req, { params }) {
  if (!UUID.test(params.fileId)) return notFound();
  const sb = admin();
  const { data: f } = await sb.from('product_files')
    .select('storage_key, file_name, products(price_cents, status)').eq('id', params.fileId).maybeSingle();
  const p = f?.products;
  if (!f || !p || p.status !== 'published' || p.price_cents !== 0) return notFound();   // paid files are never served here
  const { data, error } = await sb.storage.from('product-files').createSignedUrl(f.storage_key, 60, { download: f.file_name });
  if (error || !data?.signedUrl) return new NextResponse('Could not prepare the download. Please try again.', { status: 500 });
  return NextResponse.redirect(data.signedUrl, 302);
}
