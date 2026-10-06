import { Copy, Check } from "@phosphor-icons/react";

export default function CopyButton({ copied, onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      className={`inline-flex items-center gap-1 text-xs text-muted-fg transition-colors cursor-pointer ${className}`}
    >
      {copied ? (
        <>
          <Check size={13} weight="bold" aria-hidden="true" /> Copied
        </>
      ) : (
        <>
          <Copy size={13} weight="regular" aria-hidden="true" /> Copy
        </>
      )}
    </button>
  );
}
