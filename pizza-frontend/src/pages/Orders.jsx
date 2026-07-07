import { useEffect, useState } from 'react';
import * as endpoints from '../api/endpoints';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

const STATUS_STYLES = {
  pending: 'bg-gold/20 text-gold',
  preparing: 'bg-flame/20 text-flame',
  out_for_delivery: 'bg-basil/20 text-basil',
  delivered: 'bg-basil/30 text-basil',
  cancelled: 'bg-crust text-cream-dim',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.getMyOrders();
      setOrders(data.orders || []);
    } catch {
      showToast('Could not load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await endpoints.cancelOrder(orderId);
      showToast('Order cancelled');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel order', 'error');
    }
  };

  if (loading) return <Loader label="Fetching your orders" />;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-2xl mb-8">Your orders</h1>

      {orders.length === 0 ? (
        <p className="text-cream-dim text-center py-16 font-mono text-sm">No orders yet. Time to order some pizza.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface border border-crust rounded-2xl p-5 animate-rise">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-display text-lg">Order #{order.id}</p>
                  <p className="text-xs text-cream-dim font-mono">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-mono capitalize ${STATUS_STYLES[order.status] || 'bg-crust text-cream-dim'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-cream-dim">
                    <span>
                      {item.pizza_name || item.side_name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                    </span>
                    <span className="font-mono">₹{Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-crust mt-4 pt-3 flex items-center justify-between">
                <span className="font-mono text-gold text-lg">₹{Number(order.total_price).toFixed(2)}</span>
                {['pending', 'preparing'].includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="text-xs text-flame hover:text-cream transition-colors"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
