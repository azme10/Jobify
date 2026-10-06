import { useState } from "react";
import { EnvelopeSimple } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import CopyButton from "./CopyButton";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { generateCoverLetter } from "../api";
import { sampleCoverLetter } from "../sampleTools";

const TONES = ["Professional", "Enthusiastic", "Formal", "Conversational"];

export default function CoverLetterGenerator({ cvInput, jobDescription, isDemo }) {
  const [tone, setTone] = useState("Professional");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        setLetter(sampleCoverLetter);
      } else {
        const data = await generateCoverLetter(cvInput, jobDescription, tone.toLowerCase());
        setLetter(data.cover_letter);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="tone-select" className="text-sm font-medium text-foreground">
          Tone
        </label>
        <select
          id="tone-select"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <EnvelopeSimple size={16} weight="regular" aria-hidden="true" />
          {letter ? "Regenerate" : "Generate cover letter"}
        </button>
      </div>

      {loading && <InlineSpinner label="Drafting your cover letter…" />}
      {error && <ErrorBanner message={error} onRetry={handleGenerate} />}

      {letter && !loading && (
        <div className="relative rounded-xl border border-border bg-card p-4 animate-fade-up">
          <CopyButton
            copied={copied}
            onClick={() => copy(letter)}
            label="cover letter"
            className="absolute right-3 top-3 rounded-md border border-border bg-background px-2 py-1 hover:text-foreground"
          />
          <p className="whitespace-pre-wrap pr-16 text-sm leading-relaxed text-card-fg">{letter}</p>
        </div>
      )}
    </div>
  );
}
