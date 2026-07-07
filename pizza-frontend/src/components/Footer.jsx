export default function Footer() {
  return (
    <footer className="relative mt-auto">
      {/* torn-edge divider, receipt style */}
      <div
        className="h-4 w-full"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 25%, transparent 25%) 0 0/16px 16px, linear-gradient(225deg, var(--color-surface) 25%, transparent 25%) 0 0/16px 16px',
          backgroundColor: 'var(--color-bg)',
        }}
        aria-hidden="true"
      />

      <div className="bg-surface border-t border-crust">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 pb-8 border-b border-crust/70">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FlameMark />
                <span className="font-display text-2xl text-cream">
                  Forno<span className="text-flame">Notte</span>
                </span>
              </div>
              <p className="font-display italic text-cream-dim text-lg max-w-sm">
                "Good pizza is a promise kept, hot, every single time."
              </p>
            </div>

            <div className="flex gap-3">
              {['Instagram', 'X', 'WhatsApp'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-xs font-mono px-3 py-2 rounded-full border border-crust text-cream-dim hover:border-flame hover:text-cream transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            <div>
              <h4 className="font-mono text-xs text-gold uppercase tracking-wider mb-3">Store &amp; Hours</h4>
              <ul className="text-sm text-cream-dim flex flex-col gap-1.5">
                <li>123 MG Road, Ludhiana, Punjab</li>
                <li>Mon – Fri: 11:00 AM – 11:00 PM</li>
                <li>Sat – Sun: 11:00 AM – 12:30 AM</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs text-gold uppercase tracking-wider mb-3">Support &amp; Contact</h4>
              <ul className="text-sm text-cream-dim flex flex-col gap-1.5">
                <li>
                  <a href="tel:+911234567890" className="hover:text-cream transition-colors">+91 12345 67890</a>
                </li>
                <li>
                  <a href="mailto:support@fornonotte.com" className="hover:text-cream transition-colors">support@fornonotte.com</a>
                </li>
                <li>Order issues? We respond within 30 minutes.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs text-gold uppercase tracking-wider mb-3">Quick Links</h4>
              <ul className="text-sm text-cream-dim flex flex-col gap-1.5">
                <li><a href="/menu" className="hover:text-cream transition-colors">Full Menu</a></li>
                <li><a href="/orders" className="hover:text-cream transition-colors">Track an Order</a></li>
                <li><a href="/signup" className="hover:text-cream transition-colors">Create Account</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-crust py-5 text-center text-xs text-cream-dim font-mono">
          © {new Date().getFullYear()} FornoNotte — wood-fired, hand-tossed, always hot.
        </div>
      </div>
    </footer>
  );
}

function FlameMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 26 26" fill="none" className="animate-flicker">
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
