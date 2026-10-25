import Link from 'next/link';
export default function SiteLayout({ children }) {
  return (<>
    <header className="site-head"><div className="bar">
      <Link className="brand" href="/"><img src="/flask.png" alt="" width="40" height="40" />Little Lab Learning</Link>
      <nav><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/shop?price=free">Free</Link><Link href="/cart">Cart</Link><Link href="/about">About</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link></nav>
    </div></header>
    <main>{children}</main>
    <footer><div className="w">
      <p><img src="/flask.png" alt="" width="28" height="28" style={{ verticalAlign: 'middle', marginRight: 8 }} /><b>Little Lab Learning</b> · Where every lesson sparks a little wonder.</p>
      <p>Email: <a href="mailto:nuriya.jaffar@gmail.com">nuriya.jaffar@gmail.com</a> · WhatsApp: <a href="https://wa.me/27725384804">+27 72 538 4804</a></p>
      <p><Link href="/policy/privacy">Privacy Policy</Link> · <Link href="/policy/terms">Terms and Conditions</Link> · <Link href="/policy/refunds">Digital Product and Refund Policy</Link></p>
      <p>Little Lab Learning is not affiliated with or endorsed by the DBE or WCED.</p>
    </div></footer>
  </>);
}
