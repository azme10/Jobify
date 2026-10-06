import { WarningCircle, IdentificationBadge } from "@phosphor-icons/react";
import OverallScoreRing from "./OverallScoreRing";
import RadarChartView from "./RadarChartView";
import ProgressBars from "./ProgressBars";
import RequirementMatches from "./RequirementMatches";

export default function ScorecardView({ result }) {
  const formattingScore = Math.max(0, 100 - result.formatting_flags.length * 10);

  const metrics = [
    { label: "Keyword Match", value: Math.round(result.keyword_match_pct) },
    { label: "Clarity", value: result.clarity_score },
    { label: "Impact Verbs", value: result.impact_verb_score },
    { label: "Formatting", value: formattingScore },
  ];

  return (
    <section aria-labelledby="scorecard-heading" className="animate-fade-up">
      <h2 id="scorecard-heading" className="sr-only">
        Your ATS scorecard
      </h2>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_48px_-28px_rgba(79,70,229,0.4)] sm:p-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-brand-gradient-soft"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex flex-col items-center gap-4 justify-self-center">
            <OverallScoreRing score={result.overall_score} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-fg">
              <IdentificationBadge size={14} weight="regular" aria-hidden="true" />
              {result.seniority_level} level
            </span>
          </div>
          <RadarChartView metrics={metrics} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Score breakdown</h3>
          <ProgressBars metrics={metrics} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Formatting flags</h3>
          {result.formatting_flags.length === 0 ? (
            <p className="text-sm text-muted-fg">No formatting issues detected.</p>
          ) : (
            <ul className="space-y-3">
              {result.formatting_flags.map((flag) => (
                <li key={flag} className="flex items-start gap-2.5 text-sm text-card-fg">
                  <WarningCircle
                    size={18}
                    weight="regular"
                    className="mt-0.5 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RequirementMatches
        matches={result.requirement_matches ?? []}
        missingKeywords={result.missing_keywords ?? []}
      />
    </section>
  );
}
