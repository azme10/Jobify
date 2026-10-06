import { useEffect, useState } from "react";

const STEPS = [
  "Extracting text from your CV…",
  "Comparing against the job description…",
  "Scoring clarity and impact…",
  "Drafting rewrite suggestions…",
];

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center animate-fade-up"
    >
      <span
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-muted border-t-secondary motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-card-fg">{STEPS[stepIndex]}</p>
      <p className="text-xs text-muted-fg">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
    </div>
  );
}
