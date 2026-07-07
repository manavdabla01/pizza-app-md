import { useState } from 'react';
import { QtyStepper } from './PizzaCard';
import StarRating from './StarRating';
import ReviewsPanel from './ReviewsPanel';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function SideItemCard({ item }) {
  const sizes = Object.keys(item.prices);
  const hasSizes = sizes.length > 1;
  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const price = item.prices[size];

  const handleAdd = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem({ sideItemId: item.id, size: hasSizes ? size : undefined, quantity: qty });
      showToast(`${item.name} added to cart`);
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
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
        />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base text-cream">{item.name}</h3>
        <button type="button" onClick={() => setShowReviews(true)} aria-label="View reviews">
          {item.avgRating ? (
            <StarRating value={Number(item.avgRating)} count={item.reviewCount} size={12} />
          ) : (
            <span className="text-[11px] text-cream-dim font-mono hover:text-cream transition-colors">Rate it</span>
          )}
        </button>
        <p className="text-xs text-cream-dim line-clamp-2">{item.description}</p>

        {hasSizes && (
          <div className="flex gap-1.5 flex-wrap mt-1">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`text-[11px] font-mono px-2 py-1 rounded-md transition-colors ${
                  size === s ? 'bg-flame text-cream' : 'bg-crust text-cream-dim hover:text-cream'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-mono text-gold">₹{price}</span>
          <div className="flex items-center gap-2">
            <QtyStepper qty={qty} setQty={setQty} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-basil text-bg font-medium hover:brightness-110 transition disabled:opacity-50"
            >
              {adding ? '…' : 'Add'}
            </button>
          </div>
        </div>
      </div>
      {showReviews && <ReviewsPanel sideItemId={item.id} onClose={() => setShowReviews(false)} />}
    </article>
  );
}