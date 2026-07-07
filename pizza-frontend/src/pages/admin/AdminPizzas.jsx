import { useEffect, useState } from 'react';
import * as endpoints from '../../api/endpoints';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { name: '', description: '', toppings: '', small: '', medium: '', large: '', image: null };

export default function AdminPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.getPizzas();
      setPizzas(data.pizzas || []);
    } catch {
      showToast('Could not load pizzas', 'error');
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
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('toppings', form.toppings);
      fd.append('prices', JSON.stringify({ Small: form.small, Medium: form.medium, Large: form.large }));
      if (form.image) fd.append('image', form.image);

      await endpoints.adminAddPizza(fd);
      showToast('Pizza added');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add pizza', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await endpoints.adminDeletePizza(id);
      showToast('Pizza deleted');
      load();
    } catch {
      showToast('Could not delete pizza', 'error');
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-8">
      <form onSubmit={handleSubmit} className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-3 h-fit">
        <h2 className="font-display text-lg mb-1">Add a pizza</h2>
        <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <Input name="toppings" placeholder="Toppings (comma separated)" value={form.toppings} onChange={handleChange} required />
        <div className="grid grid-cols-3 gap-2">
          <Input name="small" placeholder="Small ₹" type="number" value={form.small} onChange={handleChange} required />
          <Input name="medium" placeholder="Medium ₹" type="number" value={form.medium} onChange={handleChange} required />
          <Input name="large" placeholder="Large ₹" type="number" value={form.large} onChange={handleChange} required />
        </div>
        <input type="file" name="image" accept="image/*" onChange={handleChange} required className="text-xs text-cream-dim" />
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-flame text-cream py-2.5 font-medium hover:bg-flame-dim transition-colors disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add pizza'}
        </button>
      </form>

      {loading ? (
        <Loader label="Loading pizzas" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 h-fit">
          {pizzas.map((p) => (
            <div key={p.id} className="bg-surface border border-crust rounded-2xl p-4 flex gap-3">
              <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-crust" />
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-cream-dim font-mono">S ₹{p.prices.Small} · M ₹{p.prices.Medium} · L ₹{p.prices.Large}</p>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-flame hover:text-cream mt-2 transition-colors">
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

export function Input(props) {
  return (
    <input
      {...props}
      className="bg-crust border border-crust rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none transition-colors"
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      rows={2}
      className="bg-crust border border-crust rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none transition-colors resize-none"
    />
  );
}
