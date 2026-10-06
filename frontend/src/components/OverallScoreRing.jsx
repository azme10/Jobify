import { getScoreBand } from "../lib/scoreBand";

const SIZE = 176;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BAND_DISPLAY = {
  strong: { label: "Strong match", color: "var(--color-accent)" },
  warning: { label: "Needs work", color: "var(--color-warning)" },
  weak: { label: "Weak match", color: "var(--color-destructive)" },
};

export default function OverallScoreRing({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const band = BAND_DISPLAY[getScoreBand(clamped)];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label={`Overall ATS match score: ${clamped} out of 100, ${band.label}`}
        className="relative"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={band.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="animate-ring-fill motion-reduce:animate-none"
            style={{
              "--ring-circumference": CIRCUMFERENCE,
              "--ring-offset": offset,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold tabular-nums text-foreground">{clamped}</span>
          <span className="text-xs text-muted-fg">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color: band.color }}>
        {band.label}
      </p>
    </div>
  );
}
