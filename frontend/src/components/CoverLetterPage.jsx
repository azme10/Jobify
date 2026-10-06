import { useId, useState } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react";
import CvInputField from "./CvInputField";
import CopyButton from "./CopyButton";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { generateFullCoverLetter } from "../api";

const TONES = ["professional", "enthusiastic", "concise", "confident"];

export default function CoverLetterPage() {
  const [cvInput, setCvInput] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [tone, setTone] = useState("professional");

  const [letter, setLetter] = useState("");
  const [letterLatex, setLetterLatex] = useState("");
  const [viewMode, setViewMode] = useState("text"); // "text" | "latex"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { copied, copy } = useCopyToClipboard();

  const jobFieldId = useId();

  const canSubmit = Boolean(cvInput) && jobDescription.trim() && senderName.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateFullCoverLetter(cvInput, {
        jobDescription,
        senderName,
        recipientName: recipientName || "Hiring Manager",
        companyName,
        location,
        date,
        tone,
      });
      setLetter(data.cover_letter);
      setLetterLatex(data.latex || "");
      setViewMode("text");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Build Cover Letter</h1>
      <p className="mt-2 text-sm text-muted-fg">
        Provide your CV and the job details, and Jobify writes a full, formally formatted cover
        letter — header, salutation, and sign-off included — grounded entirely in your real
        experience.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <CvInputField onChange={setCvInput} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <label htmlFor={jobFieldId} className="mb-2 block text-sm font-medium text-foreground">
            Job description
          </label>
          <textarea
            id={jobFieldId}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            placeholder="Paste the full job description here…"
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-fg">
            Letter details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name (sign-off)" value={senderName} onChange={setSenderName} required />
            <Field label="Recipient (Dear who)" value={recipientName} onChange={setRecipientName} placeholder="Hiring Manager" />
            <Field label="Company (to whom)" value={companyName} onChange={setCompanyName} />
            <Field label="Location (where)" value={location} onChange={setLocation} placeholder="Tunis, Tunisia" />
            <Field label="Date (when)" value={date} onChange={setDate} placeholder="September 19, 2026" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <EnvelopeSimple size={16} weight="regular" aria-hidden="true" />
          Generate cover letter
        </button>
      </form>

      {loading && <InlineSpinner label="Writing your cover letter…" />}
      {error && <ErrorBanner message={error} onRetry={handleSubmit} />}

      {letter && !loading && (
        <div className="mt-6 animate-fade-up">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("text")}
                className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                  viewMode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-fg"
                }`}
              >
                Plain text
              </button>
              <button
                type="button"
                onClick={() => setViewMode("latex")}
                className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                  viewMode === "latex" ? "bg-card text-foreground shadow-sm" : "text-muted-fg"
                }`}
              >
                LaTeX
              </button>
            </div>
          </div>
          <div className="relative">
            <CopyButton
              copied={copied}
              onClick={() => copy(viewMode === "latex" ? letterLatex : letter)}
              label={viewMode === "latex" ? "LaTeX source" : "letter"}
              className="absolute right-3 top-3 rounded-md border border-border bg-card px-2 py-1 hover:text-foreground"
            />
            {viewMode === "latex" ? (
              <pre className="max-h-[32rem] overflow-auto rounded-xl border border-border bg-muted/50 p-4 pr-16 font-mono text-xs leading-relaxed text-card-fg">
                {letterLatex}
              </pre>
            ) : (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/50 p-4 pr-16 font-sans text-sm leading-relaxed text-card-fg">
                {letter}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}
