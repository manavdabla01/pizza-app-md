import { useState } from 'react';
import SizeDial from './SizeDial';
import StarRating from './StarRating';
import ReviewsPanel from './ReviewsPanel';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function PizzaCard({ pizza }) {
  const sizes = Object.keys(pizza.prices);
  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const price = pizza.prices[size];

  const handleAdd = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem({ pizzaId: pizza.id, size, quantity: qty });
      showToast(`${pizza.name} (${size}) added to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="card-hover bg-surface rounded-2xl overflow-hidden border border-crust flex flex-col animate-rise">
      <div className="aspect-4/3 overflow-hidden bg-crust">
        <img
          src={pizza.image}
          alt={pizza.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
        />
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display text-lg text-cream">{pizza.name}</h3>
          <button
            type="button"
            onClick={() => setShowReviews(true)}
            className="mt-1"
            aria-label="View reviews"
          >
            {pizza.avgRating ? (
              <StarRating value={Number(pizza.avgRating)} count={pizza.reviewCount} />
            ) : (
              <span className="text-xs text-cream-dim font-mono hover:text-cream transition-colors">No reviews yet · Rate it</span>
            )}
          </button>
          <p className="text-sm text-cream-dim mt-1 line-clamp-2">{pizza.description}</p>
        </div>

        {pizza.toppings?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pizza.toppings.slice(0, 4).map((t) => (
              <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-crust text-basil">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between gap-3">
          <SizeDial sizes={sizes} value={size} onChange={setSize} />

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-mono text-lg text-gold">₹{price}</span>
            <div className="flex items-center gap-2">
              <QtyStepper qty={qty} setQty={setQty} />
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="text-xs px-3 py-2 rounded-lg bg-flame text-cream hover:bg-flame-dim transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showReviews && <ReviewsPanel pizzaId={pizza.id} onClose={() => setShowReviews(false)} />}
    </article>
  );
}

export function QtyStepper({ qty, setQty }) {
  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="w-6 h-6 rounded bg-crust text-cream-dim hover:text-cream flex items-center justify-center"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-5 text-center">{qty}</span>
      <button
        type="button"
        onClick={() => setQty((q) => q + 1)}
        className="w-6 h-6 rounded bg-crust text-cream-dim hover:text-cream flex items-center justify-center"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}