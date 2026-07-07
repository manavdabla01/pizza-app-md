import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import * as endpoints from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ReviewsPanel({ pizzaId, sideItemId, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = pizzaId
        ? await endpoints.getPizzaReviews(pizzaId)
        : await endpoints.getSideItemReviews(sideItemId);
      setReviews(data.reviews || []);
    } catch {
      showToast('Could not load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [pizzaId, sideItemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      showToast('Pick a star rating first', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await endpoints.addReview({ pizzaId, sideItemId, rating, comment });
      showToast('Review posted!');
      setRating(0);
      setComment('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-surface border border-crust rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col animate-rise">
        <div className="flex items-center justify-between px-5 h-14 border-b border-crust shrink-0">
          <h3 className="font-display text-lg">Reviews</h3>
          <button onClick={onClose} className="text-cream-dim hover:text-cream text-xl leading-none" aria-label="Close reviews">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {loading ? (
            <p className="text-cream-dim text-sm font-mono text-center py-6">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="text-cream-dim text-sm text-center py-6">No reviews yet — be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b border-crust/60 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cream font-medium">{r.username}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="text-xs text-cream-dim mt-1">{r.comment}</p>}
              </div>
            ))
          )}
        </div>

        {user && (
          <form onSubmit={handleSubmit} className="border-t border-crust px-5 py-4 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cream-dim font-mono">Your rating</span>
              <StarRating value={rating} onChange={setRating} size={20} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts (optional)"
              rows={2}
              className="bg-crust border border-crust rounded-lg px-3 py-2 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-flame text-cream py-2.5 text-sm font-medium hover:bg-flame-dim transition-colors disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}