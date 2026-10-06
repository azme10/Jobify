import { ArrowRight, MagnifyingGlass, FileText, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import { PAGES } from "./Navbar";

const FEATURES = [
  {
    id: PAGES.ANALYZE,
    icon: MagnifyingGlass,
    title: "Analyze PDF",
    description:
      "Upload your CV and a job description. Get an ATS match score, a keyword-gap breakdown, rewritten bullet points, and six deeper tools: interview practice, job matches, a cover letter, a bias check, project keyword suggestions, and a tailored LaTeX CV.",
  },
  {
    id: PAGES.BUILD_CV,
    icon: FileText,
    title: "Build CV",
    description:
      "Type your own details — name, profile, contact info, education, experience, projects, and skills grouped by category — and Jobify assembles them into a polished CV, delivered as ready-to-compile LaTeX source.",
  },
  {
    id: PAGES.COVER_LETTER,
    icon: EnvelopeSimple,
    title: "Build Cover Letter",
    description:
      "Provide your CV (PDF or pasted text) plus the job description, recipient, company, location, and date. Jobify writes a complete, formally formatted cover letter grounded entirely in your real experience.",
  },
];

const TRUST_POINTS = ["No login required", "Runs on a local AI model", "Nothing is ever stored"];

export default function HomePage({ onNavigate }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-fg">
          For job-seekers, not recruiters
        </p>
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
          One tool to score, build, and pitch your CV.
        </h1>
        <p className="mt-4 text-base text-muted-fg sm:text-lg">
          Jobify checks whether your résumé would pass an applicant tracking system before a
          human ever sees it, helps you build a new CV from scratch, and writes the cover
          letter to go with it — all tailored to a specific job.
        </p>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle size={16} weight="fill" className="shrink-0 text-accent" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onNavigate(PAGES.ANALYZE)}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
        >
          Analyze your CV
          <ArrowRight size={16} weight="regular" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => onNavigate(feature.id)}
              className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-colors hover:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm" aria-hidden="true">
                <Icon size={20} weight="regular" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-fg">{feature.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary">
                Open
                <ArrowRight size={14} weight="regular" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
