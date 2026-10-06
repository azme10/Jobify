import { Target } from "@phosphor-icons/react";

const SIZES = {
  sm: { badge: "h-7 w-7", icon: 14, text: "text-sm" },
  md: { badge: "h-9 w-9", icon: 18, text: "text-base" },
  lg: { badge: "h-12 w-12", icon: 24, text: "text-2xl" },
};

export default function Logo({ withWordmark = true, size = "md" }) {
  const { badge: badgeSize, icon: iconSize, text: textSize } = SIZES[size] ?? SIZES.md;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex ${badgeSize} shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm`}
        aria-hidden="true"
      >
        <Target size={iconSize} weight="bold" />
      </span>
      {withWordmark && (
        <span className={`${textSize} font-extrabold tracking-tight text-foreground`}>
          Jobify
        </span>
      )}
    </div>
  );
}
