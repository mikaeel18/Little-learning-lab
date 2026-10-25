import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// The buyer lands here after paying. This does NOT mark anything as paid; only the verified notification does.
export async function GET(req) {
  const u = new URL(req.url);
  const o = u.searchParams.get('o') || '', t = u.searchParams.get('t') || '';
  if (!/^[0-9a-f-]{36}$/i.test(o) || !/^[A-Za-z0-9_-]{20,64}$/.test(t)) return NextResponse.redirect(new URL('/cart', req.url));
  const res = NextResponse.redirect(new URL(`/order/${o}?t=${t}`, req.url));
  res.cookies.set('cart', '[]', { path: '/', maxAge: 0 });
  return res;
}
