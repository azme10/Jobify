import { ShieldCheck } from "@phosphor-icons/react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6">
        <Logo size="sm" />
        <p className="flex items-center gap-1.5 text-xs text-muted-fg">
          <ShieldCheck size={14} weight="regular" aria-hidden="true" />
          Your CV is analyzed in memory and never stored.
        </p>
        <p className="text-xs text-muted-fg">
          Jobify is a free tool for job-seekers. No account, no tracking, no catch.
        </p>
      </div>
    </footer>
  );
}
