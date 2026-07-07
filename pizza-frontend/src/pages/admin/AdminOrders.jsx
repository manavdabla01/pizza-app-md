import { useEffect, useState } from 'react';
import * as endpoints from '../../api/endpoints';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.adminGetOrders();
      setOrders(data.orders || []);
    } catch {
      showToast('Could not load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await endpoints.adminUpdateOrderStatus(id, status);
      showToast('Status updated');
      load();
    } catch {
      showToast('Could not update status', 'error');
    }
  };

  if (loading) return <Loader label="Loading orders" />;

  return (
    <div className="flex flex-col gap-4">
      {orders.length === 0 && <p className="text-cream-dim font-mono text-sm">No orders yet.</p>}
      {orders.map((order) => (
        <div key={order.id} className="bg-surface border border-crust rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg">Order #{order.id} · {order.username}</p>
              <p className="text-xs text-cream-dim font-mono">{new Date(order.created_at).toLocaleString()}</p>
              <p className="text-xs text-cream-dim mt-1">{order.address}, {order.phone}</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              className="bg-crust border border-crust rounded-lg px-3 py-2 text-xs font-mono text-cream outline-none focus:border-gold capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-cream-dim">
                <span>{item.pizza_name || item.side_name} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                <span className="font-mono">₹{Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-crust mt-3 pt-3 text-right">
            <span className="font-mono text-gold text-lg">₹{Number(order.total_price).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
