import { useEffect, useState, useMemo } from 'react';
import * as endpoints from '../api/endpoints';
import PizzaCard from '../components/PizzaCard';
import SideItemCard from '../components/SideItemCard';
import Loader from '../components/Loader';

const TABS = [
  { key: 'pizzas', label: 'Pizzas' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'desserts', label: 'Desserts' },
];

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [sideItems, setSideItems] = useState([]);
  const [tab, setTab] = useState('pizzas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pizzaRes, sideRes] = await Promise.all([endpoints.getPizzas(), endpoints.getSideItems()]);
        if (!mounted) return;
        setPizzas(pizzaRes.data.pizzas || []);
        setSideItems(sideRes.data.items || []);
      } catch {
        if (mounted) setError('Could not reach the kitchen. Is the backend running?');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredPizzas = useMemo(
    () => pizzas.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase())),
    [pizzas, search]
  );

  const filteredSides = useMemo(
    () =>
      sideItems.filter(
        (i) => i.category === tab && i.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [sideItems, tab, search]
  );

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl">Menu</h1>
          <p className="text-cream-dim text-sm mt-1">Everything hot and ready to order.</p>
        </div>

        <div className="relative sm:ml-auto w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu…"
            className="w-full bg-surface border border-crust rounded-full pl-9 pr-4 py-2 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 sticky top-16 bg-bg/95 backdrop-blur z-30 pt-4 -mt-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors font-medium ${
              tab === t.key
                ? 'bg-flame text-cream'
                : 'bg-surface text-cream-dim hover:text-cream border border-crust'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <Loader label="Firing up the oven" />}

      {error && <p className="text-center text-flame font-mono text-sm py-16">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tab === 'pizzas'
            ? filteredPizzas.map((p) => <PizzaCard key={p.id} pizza={p} />)
            : filteredSides.map((i) => <SideItemCard key={i.id} item={i} />)}

          {tab === 'pizzas' && filteredPizzas.length === 0 && (
            <p className="col-span-full text-center text-cream-dim py-16 font-mono text-sm">
              No pizzas match "{search}".
            </p>
          )}

          {tab !== 'pizzas' && filteredSides.length === 0 && (
            <p className="col-span-full text-center text-cream-dim py-16 font-mono text-sm">
              {search ? `No items match "${search}".` : 'Nothing here yet.'}
            </p>
          )}
        </div>
      )}
    </section>
  );
}