// Shared thresholds for scoring 0-100 metrics across the scorecard.
// Keep this the single source of truth so the ring, bars, and any future
// score display can't drift out of sync on what counts as "strong".
export function getScoreBand(value) {
  if (value >= 80) return "strong";
  if (value >= 55) return "warning";
  return "weak";
}
