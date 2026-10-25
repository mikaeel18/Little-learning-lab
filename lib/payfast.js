import crypto from 'crypto';
import dns from 'dns/promises';

// PayFast helpers. SERVER ONLY. The passphrase must never reach the browser.
export const siteUrl = () => (process.env.SITE_URL || '').replace(/\/$/, '');
export const pfHost = () => (process.env.PAYFAST_MODE === 'live' ? 'www.payfast.co.za' : 'sandbox.payfast.co.za');   // anything but "live" means practice mode
export const processUrl = () => `https://${pfHost()}/eng/process`;
export const sha256 = (x) => crypto.createHash('sha256').update(String(x)).digest('hex');
export const newToken = () => crypto.randomBytes(24).toString('base64url');

// PayFast's signature uses PHP's urlencode(): spaces become "+", and ! ' ( ) * ~ are encoded.
export const phpUrlencode = (s) => encodeURIComponent(String(s))
  .replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g, '+');

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const withPass = (s, pass) => (pass ? `${s}&passphrase=${phpUrlencode(String(pass).trim())}` : s);

// Signature for the payment form. Fields must be in the order they are sent. Empty values are left out.
export function checkoutSignature(fields, passphrase) {
  const s = Object.entries(fields).filter(([, v]) => String(v).trim() !== '')
    .map(([k, v]) => `${k}=${phpUrlencode(String(v).trim())}`).join('&');
  return md5(withPass(s, passphrase));
}
// For notifications: every field PayFast posted, in posted order, except the signature itself.
export const itnParamString = (entries) => entries.filter(([k]) => k !== 'signature').map(([k, v]) => `${k}=${phpUrlencode(v)}`).join('&');
export const itnSignature = (paramString, passphrase) => md5(withPass(paramString, passphrase));

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
export function tokenOk(token, hash) { return !!token && !!hash && safeEqual(sha256(token), hash); }

export const clientIp = (req) => (req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || '')
  .trim().replace(/^::ffff:/, '');

// Is this request really coming from PayFast's servers?
export async function sourceIsPayfast(ip) {
  for (const h of ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za']) {
    try { if ((await dns.lookup(h, { all: true })).some((a) => a.address === ip)) return true; } catch {}
  }
  return false;
}
// Ask PayFast to confirm it really sent this notification.
export async function serverConfirms(paramString) {
  const res = await fetch(`https://${pfHost()}/eng/query/validate`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: paramString });
  return (await res.text()).trim() === 'VALID';
}
