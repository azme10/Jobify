import { Scales, CheckCircle } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useDemoFetch } from "../hooks/useDemoFetch";
import { fetchBiasCheck } from "../api";
import { sampleBiasFlags } from "../sampleTools";

export default function BiasChecker({ cvInput, isDemo }) {
  const { data: flags, loading, error } = useDemoFetch(
    () => fetchBiasCheck(cvInput).then((d) => d.flags),
    sampleBiasFlags,
    isDemo,
    [cvInput, isDemo]
  );

  if (loading) return <InlineSpinner label="Scanning for non-inclusive language…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm text-muted-fg">
        <Scales size={16} weight="regular" aria-hidden="true" />
        Gendered, age-coded, or exclusionary phrasing that could affect how your CV reads.
      </p>

      {flags.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/5 p-4 text-sm text-card-fg">
          <CheckCircle size={18} weight="regular" className="text-accent" aria-hidden="true" />
          No non-inclusive language detected.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {flags.map((f) => (
            <li key={f.phrase} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-fg">
                  {f.category}
                </span>
                <s className="text-sm text-card-fg decoration-destructive/60">"{f.phrase}"</s>
              </div>
              <p className="text-sm text-accent">Try: "{f.suggestion}"</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
