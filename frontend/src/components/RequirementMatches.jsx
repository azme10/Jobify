import { CheckCircle, WarningCircle, XCircle, Tag } from "@phosphor-icons/react";

const STATUS_DISPLAY = {
  covered: { icon: CheckCircle, className: "text-accent", label: "Covered" },
  partial: { icon: WarningCircle, className: "text-warning", label: "Partial" },
  missing: { icon: XCircle, className: "text-destructive", label: "Missing" },
};

export default function RequirementMatches({ matches, missingKeywords }) {
  if (matches.length === 0 && missingKeywords.length === 0) return null;

  return (
    <div className="mt-6 grid gap-6">
      {matches.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Requirement match</h3>
          <p className="mb-4 text-xs text-muted-fg">
            Each requirement from the job description, and what in your CV backs it up.
          </p>
          <ul className="space-y-3">
            {matches.map((match) => {
              const status = STATUS_DISPLAY[match.status] ?? STATUS_DISPLAY.partial;
              const StatusIcon = status.icon;
              return (
                <li key={match.requirement} className="flex items-start gap-2.5">
                  <StatusIcon
                    size={18}
                    weight="regular"
                    className={`mt-0.5 shrink-0 ${status.className}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-fg">
                      {match.requirement}
                      {match.importance === "must-have" && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-fg">
                          must-have
                        </span>
                      )}
                      <span className="sr-only"> — {status.label}</span>
                    </p>
                    {match.evidence && (
                      <p className="mt-0.5 text-xs text-muted-fg">{match.evidence}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Missing keywords</h3>
          <p className="mb-3 text-xs text-muted-fg">
            Terms this job description uses that your CV never states. Add the ones you can back
            up.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary"
              >
                <Tag size={12} weight="regular" aria-hidden="true" />
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
