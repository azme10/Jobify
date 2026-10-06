import { CheckCircle } from "@phosphor-icons/react";
import UploadPanel from "./UploadPanel";

const TRUST_POINTS = ["No login required", "Results in under 30 seconds", "Nothing is ever stored"];

export default function LandingSection({ onAnalyze, onViewSample }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-fg">
            For job-seekers, not recruiters
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Know if your résumé passes the robots before a human sees it.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-fg sm:text-lg">
            Upload your CV and a job description. Get an ATS match score, a keyword-gap
            breakdown, and rewritten bullet points.
          </p>

          <ul className="mt-8 space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle size={18} weight="fill" className="shrink-0 text-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(79,70,229,0.35)] sm:p-8">
          <UploadPanel onAnalyze={onAnalyze} onViewSample={onViewSample} />
        </div>
      </div>
    </div>
  );
}
