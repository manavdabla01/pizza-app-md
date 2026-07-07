import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, totals, drawerOpen, setDrawerOpen, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQty = async (cartItemId, qty) => {
    try {
      await updateQuantity(cartItemId, qty);
    } catch {
      showToast('Could not update quantity', 'error');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
      showToast('Item removed');
    } catch {
      showToast('Could not remove item', 'error');
    }
  };

  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-surface border-l border-crust z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-crust">
          <h2 className="font-display text-lg">Your Order</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="text-cream-dim hover:text-cream text-xl leading-none"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-16">
              <span className="text-3xl">🍕</span>
              <p className="text-cream-dim text-sm">Your cart's empty. Add something hot.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="flex gap-3 border-b border-crust/60 pb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-crust shrink-0"
                  onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-cream truncate">{item.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.cartItemId)}
                      className="text-cream-dim hover:text-flame text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  {item.size && <p className="text-xs text-cream-dim font-mono">{item.size}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <button
                        onClick={() => handleQty(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-crust hover:text-cream text-cream-dim"
                      >
                        −
                      </button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-crust hover:text-cream text-cream-dim"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono text-gold text-sm">₹{Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-crust px-5 py-4 flex flex-col gap-2">
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="Tax" value={totals.tax} />
            <Row label="Delivery Fee" value={totals.deliveryFee} />
            <Row label="Total" value={totals.totalPrice} bold />
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-2 w-full rounded-xl bg-flame text-cream py-3 font-medium hover:bg-flame-dim transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'text-cream font-semibold text-base' : 'text-cream-dim'}`}>
      <span>{label}</span>
      <span className="font-mono">₹{Number(value).toFixed(2)}</span>
    </div>
  );
}
