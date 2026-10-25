export default function AdminLayout({ children }) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 18px', background: '#DCCFF0' }}>
        <a href="/admin">Products</a><a href="/admin/orders">Orders</a>
        <a href="/admin/reviews">Reviews</a><a href="/admin/faqs">FAQs</a><a href="/admin/enquiries">Enquiries</a>
        <a href="/admin/text">Website text</a>
      </nav>
      {children}
    </div>
  );
}
