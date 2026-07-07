import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as endpoints from '../api/endpoints';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { Field } from './Login';

const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI', hint: 'Pay via GPay, PhonePe, Paytm' },
  { key: 'card', label: 'Card', hint: 'Credit or debit card' },
  { key: 'cod', label: 'Cash on Delivery', hint: 'Pay when it arrives' },
];

export default function Checkout() {
  const { items, totals, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: user?.username || '',
    phone: '',
    email: user?.email || '',
    address: '',
    paymentMethod: 'upi',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Cash on Delivery — skip the payment gateway entirely
  const finalizeOrder = async (extra = {}) => {
    const { data } = await endpoints.checkoutOrder({ ...form, ...extra });
    showToast('Order placed! Tracking it now.');
    await refreshCart();
    navigate('/orders', { state: { justPlaced: data.order?.id } });
  };

  // UPI / Card — open Razorpay, verify signature server-side, then finalize
  const payWithRazorpay = async () => {
    await loadRazorpayScript();

    const { data: orderData } = await endpoints.createRazorpayOrder();

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'FornoNotte',
        description: 'Pizza order payment',
        prefill: { name: form.customerName, email: form.email, contact: form.phone },
        theme: { color: '#E8552E' },
        handler: async (response) => {
          try {
            await endpoints.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await finalizeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (form.paymentMethod === 'cod') {
        await finalizeOrder();
      } else {
        await payWithRazorpay();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Checkout failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-4xl">🍕</span>
        <p className="text-cream-dim">Your cart is empty — add something before checking out.</p>
        <Link to="/menu" className="text-gold hover:text-cream text-sm">Back to menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 animate-rise">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 items-start">
        {/* LEFT: address + payment */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-display text-lg">Delivery details</h2>
            <Field label="Full name" name="customerName" value={form.customerName} onChange={handleChange} required />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-cream-dim font-mono">Delivery address</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                className="bg-crust border border-crust rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none transition-colors resize-none"
              />
            </label>
          </div>

          <div className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="font-display text-lg mb-1">Payment method</h2>
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.key}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  form.paymentMethod === m.key
                    ? 'border-flame bg-flame/10'
                    : 'border-crust hover:border-cream-dim/40'
                }`}
              >
                <div>
                  <p className="text-sm text-cream font-medium">{m.label}</p>
                  <p className="text-xs text-cream-dim">{m.hint}</p>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.key}
                  checked={form.paymentMethod === m.key}
                  onChange={handleChange}
                  className="accent-flame w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT: billing breakdown */}
        <div className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-4 md:sticky md:top-24">
          <h2 className="font-display text-lg">Order summary</h2>

          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-sm">
                <span className="text-cream-dim">
                  {item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                </span>
                <span className="font-mono text-cream">₹{Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-crust pt-4 flex flex-col gap-2">
            <Row label="Subtotal" value={totals.subtotal} />
            <Row label="Tax" value={totals.tax} />
            <Row label="Delivery Fee" value={totals.deliveryFee} />
            <Row label="Total" value={totals.totalPrice} bold />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-flame text-cream py-3 font-medium hover:bg-flame-dim transition-colors disabled:opacity-50"
          >
            {submitting
              ? 'Processing…'
              : form.paymentMethod === 'cod'
              ? `Place order · ₹${Number(totals.totalPrice).toFixed(2)}`
              : `Pay ₹${Number(totals.totalPrice).toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
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