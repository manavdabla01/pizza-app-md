export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-crust" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-flame animate-spin" />
      </div>
      <p className="font-mono text-xs text-cream-dim tracking-wide">{label}...</p>
    </div>
  );
}
