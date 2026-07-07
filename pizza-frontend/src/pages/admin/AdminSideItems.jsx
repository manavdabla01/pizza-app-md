import { useEffect, useState } from 'react';
import * as endpoints from '../../api/endpoints';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';
import { Input, Textarea } from './AdminPizzas';

const EMPTY_FORM = { name: '', description: '', category: 'drinks', prices: '{"Regular": 0}', image: null };

export default function AdminSideItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.getSideItems();
      setItems(data.items || []);
    } catch {
      showToast('Could not load side items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      JSON.parse(form.prices); // validate before sending
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('prices', form.prices);
      if (form.image) fd.append('image', form.image);

      await endpoints.adminAddSideItem(fd);
      showToast('Item added');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid prices JSON or request failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await endpoints.adminDeleteSideItem(id);
      showToast('Item deleted');
      load();
    } catch {
      showToast('Could not delete item', 'error');
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-8">
      <form onSubmit={handleSubmit} className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-3 h-fit">
        <h2 className="font-display text-lg mb-1">Add a side item</h2>
        <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="bg-crust border border-crust rounded-lg px-3 py-2.5 text-sm text-cream outline-none focus:border-gold"
        >
          <option value="drinks">Drinks</option>
          <option value="snacks">Snacks</option>
          <option value="desserts">Desserts</option>
        </select>
        <Input
          name="prices"
          placeholder='Prices JSON e.g. {"Regular": 89}'
          value={form.prices}
          onChange={handleChange}
          required
        />
        <input type="file" name="image" accept="image/*" onChange={handleChange} required className="text-xs text-cream-dim" />
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-basil text-bg py-2.5 font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add item'}
        </button>
      </form>

      {loading ? (
        <Loader label="Loading items" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 h-fit">
          {items.map((i) => (
            <div key={i.id} className="bg-surface border border-crust rounded-2xl p-4 flex gap-3">
              <img src={i.image} alt={i.name} className="w-16 h-16 rounded-lg object-cover bg-crust" />
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{i.name}</p>
                <p className="text-xs text-cream-dim font-mono capitalize">{i.category}</p>
                <p className="text-xs text-gold font-mono">
                  {Object.entries(i.prices).map(([k, v]) => `${k} ₹${v}`).join(' · ')}
                </p>
                <button onClick={() => handleDelete(i.id)} className="text-xs text-flame hover:text-cream mt-2 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
