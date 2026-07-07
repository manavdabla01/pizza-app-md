import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Field } from './Login';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { doSignup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doSignup({ ...form, role: 'customer' });
      showToast('Account created — log in to continue');
      navigate('/login');
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
          <h1 className="font-display text-3xl text-cream">Join the table</h1>
          <p className="text-cream-dim text-sm mt-2">Create an account to start ordering</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-crust rounded-2xl p-6 flex flex-col gap-4">
          <Field label="Username" name="username" value={form.username} onChange={handleChange} required />
          <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Field label="Password" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-flame text-cream py-3 font-medium hover:bg-flame-dim transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-cream-dim mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:text-cream transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
