import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as endpoints from '../api/endpoints';
import StarRating from '../components/StarRating';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPizzas />
      <CategoryShowcase />
      <Testimonials />
      <CtaBanner />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-crust">
      <div className="max-w-6xl mx-auto px-5 py-20 sm:py-28 relative z-10">
        <p className="font-mono text-xs text-gold tracking-[0.2em] uppercase mb-4 animate-rise">
          Wood-fired · Since tonight
        </p>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-2xl animate-rise" style={{ animationDelay: '0.05s' }}>
          Hand-tossed pizza,
          <br />
          <span className="italic text-flame">delivered hot.</span>
        </h1>
        <p className="text-cream-dim mt-5 max-w-md animate-rise" style={{ animationDelay: '0.1s' }}>
          Pick your size, load your toppings, and we'll have it in the oven before you finish scrolling.
        </p>
        <Link
          to="/menu"
          className="inline-block mt-8 rounded-xl bg-flame text-cream px-6 py-3 font-medium hover:bg-flame-dim transition-colors animate-rise"
          style={{ animationDelay: '0.15s' }}
        >
          View menu
        </Link>
      </div>

      <div className="absolute right-8 top-10 hidden md:flex gap-3 opacity-60" aria-hidden="true">
        <div className="w-1.5 h-16 rounded-full bg-cream/10 animate-steam" />
        <div className="w-1.5 h-20 rounded-full bg-cream/10 animate-steam" style={{ animationDelay: '0.6s' }} />
        <div className="w-1.5 h-14 rounded-full bg-cream/10 animate-steam" style={{ animationDelay: '1.2s' }} />
      </div>
    </section>
  );
}

// ---------- Featured Pizzas (data-driven: /pizzas, top rated first) ----------
function FeaturedPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await endpoints.getPizzas();
        if (!mounted) return;
        const sorted = [...(data.pizzas || [])].sort(
          (a, b) => (b.avgRating || 0) - (a.avgRating || 0)
        );
        setPizzas(sorted.slice(0, 3));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!loading && pizzas.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-5 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-gold tracking-[0.15em] uppercase mb-2">Crowd favorites</p>
          <h2 className="font-display text-3xl">Straight from the oven</h2>
        </div>
        <Link to="/menu" className="text-sm text-cream-dim hover:text-cream transition-colors hidden sm:block">
          See full menu →
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-4/3 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-6">
          {pizzas.map((p, i) => (
            <Link
              to="/menu"
              key={p.id}
              className="card-hover group bg-surface rounded-2xl overflow-hidden border border-crust animate-rise"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="aspect-4/3 overflow-hidden bg-crust">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-cream">{p.name}</h3>
                {p.avgRating ? (
                  <StarRating value={Number(p.avgRating)} count={p.reviewCount} />
                ) : (
                  <span className="text-xs text-cream-dim font-mono">New on the menu</span>
                )}
                <p className="font-mono text-gold mt-2">From ₹{Math.min(...Object.values(p.prices))}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- Category Showcase (data-driven: counts pulled live from pizzas + sideitems) ----------
function CategoryShowcase() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pizzaRes, sideRes] = await Promise.all([endpoints.getPizzas(), endpoints.getSideItems()]);
        if (!mounted) return;
        const items = sideRes.data.items || [];
        setCounts({
          pizzas: (pizzaRes.data.pizzas || []).length,
          drinks: items.filter((i) => i.category === 'drinks').length,
          snacks: items.filter((i) => i.category === 'snacks').length,
          desserts: items.filter((i) => i.category === 'desserts').length,
        });
      } catch {
        if (mounted) setCounts({ pizzas: 0, drinks: 0, snacks: 0, desserts: 0 });
      }
    })();
    return () => { mounted = false; };
  }, []);

  const categories = [
    { key: 'pizzas', label: 'Pizzas', emoji: '🍕' },
    { key: 'drinks', label: 'Drinks', emoji: '🥤' },
    { key: 'snacks', label: 'Snacks', emoji: '🍟' },
    { key: 'desserts', label: 'Desserts', emoji: '🍰' },
  ];

  return (
    <section className="border-y border-crust bg-surface/50">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <p className="font-mono text-xs text-gold tracking-[0.15em] uppercase mb-2">Browse by category</p>
        <h2 className="font-display text-3xl mb-8">What are you craving?</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Link
              key={c.key}
              to="/menu"
              className="card-hover bg-surface-raised border border-crust rounded-2xl p-6 text-center animate-rise"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="text-3xl block mb-2">{c.emoji}</span>
              <p className="font-display text-lg text-cream">{c.label}</p>
              <p className="font-mono text-xs text-cream-dim mt-1">
                {counts ? `${counts[c.key]} item${counts[c.key] === 1 ? '' : 's'}` : '···'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Testimonials (curated — real reviews live on each item's review panel) ----------
const CURATED_TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    comment: 'Ordered on a whim at midnight — arrived hot, cheese still bubbling. Now our Friday ritual.',
    name: 'Aarav M.',
  },
  {
    id: 2,
    rating: 5,
    comment: "The size dial thing on the site is oddly satisfying. Also the pizza's genuinely great.",
    name: 'Simran K.',
  },
  {
    id: 3,
    rating: 4,
    comment: 'Fast delivery, generous toppings, and the garlic breadsticks are criminally good.',
    name: 'Rohan D.',
  },
];

function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20">
      <p className="font-mono text-xs text-gold tracking-[0.15em] uppercase mb-2">What people are saying</p>
      <h2 className="font-display text-3xl mb-10">Loved by regulars</h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {CURATED_TESTIMONIALS.map((r, i) => (
          <div
            key={r.id}
            className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-3 animate-rise"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <StarRating value={r.rating} />
            <p className="text-cream-dim text-sm leading-relaxed">"{r.comment}"</p>
            <p className="font-mono text-xs text-cream-dim mt-auto pt-2 border-t border-crust/60">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="border-t border-crust bg-surface/50">
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl mb-4">Hungry yet?</h2>
        <p className="text-cream-dim max-w-md mx-auto mb-8">
          The oven's warm and the toppings are fresh. Your next favorite slice is a tap away.
        </p>
        <Link
          to="/menu"
          className="inline-block rounded-xl bg-flame text-cream px-8 py-3.5 font-medium hover:bg-flame-dim transition-colors"
        >
          Order now
        </Link>
      </div>
    </section>
  );
}
