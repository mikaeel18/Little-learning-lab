import { cookies } from 'next/headers';
const UUID = /^[0-9a-f-]{36}$/i;
export function getCart() {
  try { return JSON.parse(cookies().get('cart')?.value || '[]').filter((id) => UUID.test(id)).slice(0, 50); } catch { return []; }
}
export function setCart(ids) {
  cookies().set('cart', JSON.stringify([...new Set(ids)].slice(0, 50)),
    { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === 'production' });
}
