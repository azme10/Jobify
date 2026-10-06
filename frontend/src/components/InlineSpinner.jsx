export default function InlineSpinner({ label }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-6 text-sm text-muted-fg">
      <span
        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-muted border-t-secondary motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
