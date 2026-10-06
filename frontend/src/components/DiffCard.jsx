import { Lightbulb, ArrowRight } from "@phosphor-icons/react";
import CopyButton from "./CopyButton";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

export default function DiffCard({ suggestion, index }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-fg">
        Suggestion {index + 1}
      </p>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-4">
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <p className="mb-1.5 text-xs font-medium text-destructive">Original</p>
          <p className="text-sm text-card-fg">
            <s className="decoration-destructive/60">{suggestion.original}</s>
          </p>
        </div>

        <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
          <ArrowRight size={18} weight="regular" className="text-muted-fg" />
        </div>

        <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-accent">Improved</p>
            <CopyButton
              copied={copied}
              onClick={() => copy(suggestion.improved)}
              label="improved text"
              className="rounded-md px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
            />
          </div>
          <p className="text-sm font-medium text-card-fg">{suggestion.improved}</p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-sm text-muted-fg">
        <Lightbulb size={16} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>{suggestion.reason}</p>
      </div>
    </li>
  );
}
