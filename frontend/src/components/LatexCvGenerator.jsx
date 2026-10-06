import { useState } from "react";
import { Code } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import CopyButton from "./CopyButton";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { generateLatexCv } from "../api";
import { sampleLatexCv } from "../sampleTools";

export default function LatexCvGenerator({ cvInput, jobDescription, isDemo }) {
  const [latex, setLatex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { copied, copy } = useCopyToClipboard();

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        setLatex(sampleLatexCv);
      } else {
        const data = await generateLatexCv(cvInput, jobDescription);
        setLatex(data.latex);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-fg">
        Generates a tailored CV as LaTeX source, retargeted at this job description. Paste
        it into{" "}
        <a
          href="https://www.overleaf.com"
          target="_blank"
          rel="noreferrer"
          className="text-secondary underline"
        >
          Overleaf
        </a>{" "}
        to compile a PDF.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <Code size={16} weight="regular" aria-hidden="true" />
        {latex ? "Regenerate" : "Generate LaTeX CV"}
      </button>

      {loading && <InlineSpinner label="Rewriting your CV as LaTeX…" />}
      {error && <ErrorBanner message={error} onRetry={handleGenerate} />}

      {latex && !loading && (
        <div className="relative animate-fade-up">
          <CopyButton
            copied={copied}
            onClick={() => copy(latex)}
            label="LaTeX source"
            className="absolute right-3 top-3 rounded-md border border-border bg-card px-2 py-1 hover:text-foreground"
          />
          <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-muted/50 p-4 pr-16 font-mono text-xs leading-relaxed text-card-fg">
            {latex}
          </pre>
        </div>
      )}
    </div>
  );
}
