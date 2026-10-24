import Link from 'next/link';
export default function AdminLayout({ children }) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 18px', background: '#DCCFF0' }}>
        <Link href="/admin">Products</Link><Link href="/admin/orders">Orders</Link>
        <Link href="/admin/reviews">Reviews</Link><Link href="/admin/faqs">FAQs</Link>
        <Link href="/admin/text">Website text</Link>
      </nav>
      {children}
    </div>
  );
}
