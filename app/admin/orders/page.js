import { requireAdmin } from '../../../lib/admin';
const rand = (c) => 'R' + (c / 100).toFixed(2);

export default async function Orders() {
  const sb = await requireAdmin();
  const { data: orders } = await sb.from('orders')
    .select('id, email, status, total_cents, created_at').order('created_at', { ascending: false }).limit(100);
  const { data: paid } = await sb.from('orders').select('total_cents').eq('status', 'paid');
  const total = (paid || []).reduce((a, o) => a + o.total_cents, 0);
  return (
    <main style={{ maxWidth: 800, margin: '30px auto', padding: 18 }}>
      <h1>Orders</h1>
      <p>Paid sales so far: <b>{rand(total)}</b> ({paid?.length || 0} paid orders)</p>
      {!orders?.length && <p>No orders yet.</p>}
      <table style={{ width: '100%' }}><tbody>
        {orders?.map((o) => (
          <tr key={o.id}>
            <td>{new Date(o.created_at).toLocaleDateString('en-ZA')}</td><td>{o.email}</td>
            <td>{rand(o.total_cents)}</td><td>{o.status}</td>
          </tr>
        ))}
      </tbody></table>
    </main>
  );
}
