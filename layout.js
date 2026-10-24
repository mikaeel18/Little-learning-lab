import Link from 'next/link';
export default function SiteLayout({ children }) {
  return (<>
    <header className="site-head"><div className="bar">
      <Link className="brand" href="/">⭐ Little Lab Learning</Link>
      <nav><Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/shop?price=free">Free</Link><Link href="/cart">Cart</Link></nav>
    </div></header>
    <main>{children}</main>
    <footer><div className="w">
      <p><b>Little Lab Learning</b> · Where every lesson sparks a little wonder.</p>
      <p>Email: <a href="mailto:nuriya.jaffar@gmail.com">nuriya.jaffar@gmail.com</a> · WhatsApp: <a href="https://wa.me/27725384804">+27 72 538 4804</a></p>
      <p>Little Lab Learning is not affiliated with or endorsed by the DBE or WCED.</p>
    </div></footer>
  </>);
}
