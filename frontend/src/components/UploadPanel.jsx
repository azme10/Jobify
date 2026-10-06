import { useId, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import CvInputField from "./CvInputField";

export default function UploadPanel({ onAnalyze, onViewSample, disabled }) {
  const [cvInput, setCvInput] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const jobFieldId = useId();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onAnalyze(cvInput, jobDescription);
  }

  const canSubmit = Boolean(cvInput) && jobDescription.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CvInputField onChange={setCvInput} />

      <div>
        <label htmlFor={jobFieldId} className="mb-2 block text-sm font-medium text-foreground">
          Target job description
        </label>
        <textarea
          id={jobFieldId}
          placeholder="Paste the full job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={7}
          className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-card-fg placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <p className="mt-1 text-xs text-muted-fg">{jobDescription.trim().length} characters</p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onViewSample}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <Sparkle size={16} weight="regular" aria-hidden="true" />
          View a sample result
        </button>
        <button
          type="submit"
          disabled={!canSubmit || disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Analyze my CV
        </button>
      </div>
    </form>
  );
}
