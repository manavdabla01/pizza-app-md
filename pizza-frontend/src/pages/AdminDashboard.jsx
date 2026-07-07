import { useState } from 'react';
import AdminPizzas from './admin/AdminPizzas';
import AdminSideItems from './admin/AdminSideItems';
import AdminOrders from './admin/AdminOrders';

const TABS = [
  { key: 'pizzas', label: 'Pizzas' },
  { key: 'sides', label: 'Side Items' },
  { key: 'orders', label: 'Orders' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('pizzas');

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl mb-8">Kitchen control</h1>

      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-flame text-cream' : 'bg-surface border border-crust text-cream-dim hover:text-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pizzas' && <AdminPizzas />}
      {tab === 'sides' && <AdminSideItems />}
      {tab === 'orders' && <AdminOrders />}
    </div>
  );
}
