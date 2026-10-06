import DiffCard from "./DiffCard";

export default function RewritePanel({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <section aria-label="Rewrite suggestions" className="animate-fade-up">
      <ul className="space-y-4">
        {suggestions.map((s, i) => (
          <DiffCard key={`${s.original}-${i}`} suggestion={s} index={i} />
        ))}
      </ul>
    </section>
  );
}
