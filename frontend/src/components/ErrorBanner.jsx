import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up"
    >
      <div className="flex items-start gap-2.5">
        <WarningCircle size={20} weight="regular" className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
        <p className="text-sm text-card-fg">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
        >
          <ArrowClockwise size={14} weight="regular" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
