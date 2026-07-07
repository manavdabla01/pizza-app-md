import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, doLogout, isAdmin } = useAuth();
  const { itemCount, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    doLogout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-bg/85 border-b border-crust">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <FlameMark />
          <span className="font-display text-xl tracking-tight text-cream group-hover:text-flame transition-colors">
            Forno<span className="text-flame">Notte</span>
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/menu" className="hidden sm:block text-sm text-cream-dim hover:text-cream transition-colors">
            Menu
          </Link>

          {user && (
            <Link to="/orders" className="hidden sm:block text-sm text-cream-dim hover:text-cream transition-colors">
              Orders
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="hidden sm:block text-sm text-gold hover:text-cream transition-colors">
              Admin
            </Link>
          )}

          {user ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 hover:bg-crust transition-colors"
              aria-label="Open cart"
            >
              <CartMark />
              <span className="text-sm font-mono">{itemCount}</span>
            </button>
          ) : null}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-full border border-crust text-cream-dim hover:border-flame hover:text-cream transition-colors"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm px-4 py-1.5 rounded-full bg-flame text-cream hover:bg-flame-dim transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function FlameMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="animate-flicker">
      <path
        d="M13 2C13 2 8 7.5 8 12.5C8 15 9.5 16.5 11 16.5C10.3 15.3 10.5 14 11.2 13.3C11.2 15 12.5 16 13.5 15C14.3 14.3 14.3 13 13.5 12C15 12.7 16 14.3 16 16C16 19.5 13.8 22 10.5 22C6.5 22 4 19 4 15.5C4 9.5 13 2 13 2Z"
        fill="#E8552E"
      />
      <path
        d="M15 8C15 8 18 11 18 14.5C18 17 16.5 18.5 15 18.5C17 17.5 17.5 15 16.5 13C16.8 15.5 15 17 13.5 16C15 14.5 14.5 11 15 8Z"
        fill="#D9A441"
      />
    </svg>
  );
}

function CartMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
