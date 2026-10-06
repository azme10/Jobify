import { Briefcase } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useDemoFetch } from "../hooks/useDemoFetch";
import { fetchJobRecommendations } from "../api";
import { sampleJobRecommendations } from "../sampleTools";

export default function JobRecommendations({ cvInput, isDemo }) {
  const { data: recs, loading, error } = useDemoFetch(
    () => fetchJobRecommendations(cvInput).then((d) => d.recommendations),
    sampleJobRecommendations,
    isDemo,
    [cvInput, isDemo]
  );

  if (loading) return <InlineSpinner label="Matching your CV against job titles…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-fg">
        Roles your CV semantically matches, beyond the one you targeted.
      </p>
      <ul className="space-y-2.5">
        {recs.map((r) => (
          <li key={r.title} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-card-fg">
                <Briefcase size={16} weight="regular" className="text-secondary" aria-hidden="true" />
                {r.title}
              </span>
              <span className="shrink-0 tabular-nums text-sm font-medium text-muted-fg">
                {Math.round(r.match_pct)}%
              </span>
            </div>
            <p className="mb-2 text-xs text-muted-fg">{r.description}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${Math.max(0, Math.min(100, r.match_pct))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
