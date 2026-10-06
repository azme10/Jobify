import { getScoreBand } from "../lib/scoreBand";

const BAND_COLOR = {
  strong: "bg-accent",
  warning: "bg-warning",
  weak: "bg-destructive",
};

export default function ProgressBars({ metrics }) {
  return (
    <ul className="space-y-4">
      {metrics.map((m) => (
        <li key={m.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{m.label}</span>
            <span className="tabular-nums text-muted-fg">{m.value}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={m.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={m.label}
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${BAND_COLOR[getScoreBand(m.value)]}`}
              style={{ width: `${Math.max(0, Math.min(100, m.value))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
