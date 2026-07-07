import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { doLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doLogin(form);
      showToast('Welcome back!');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-rise">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-cream">Welcome back</h1>
          <p className="text-cream-dim text-sm mt-2">Log in to order your favorites</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-4">
          <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Field label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-flame text-cream py-3 font-medium hover:bg-flame-dim transition-colors disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-cream-dim mt-5">
          New here?{' '}
          <Link to="/signup" className="text-gold hover:text-cream transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-cream-dim font-mono">{label}</span>
      <input
        {...props}
        className="bg-crust border border-crust rounded-lg px-3 py-2.5 text-sm text-cream placeholder:text-cream-dim/50 focus:border-gold outline-none transition-colors"
      />
    </label>
  );
}
