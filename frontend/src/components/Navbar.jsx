import { useState } from "react";
import { House, MagnifyingGlass, FileText, EnvelopeSimple, List, X } from "@phosphor-icons/react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export const PAGES = {
  HOME: "home",
  ANALYZE: "analyze",
  BUILD_CV: "build-cv",
  COVER_LETTER: "cover-letter",
};

const NAV_ITEMS = [
  { id: PAGES.HOME, label: "Home", icon: House },
  { id: PAGES.ANALYZE, label: "Analyze PDF", icon: MagnifyingGlass },
  { id: PAGES.BUILD_CV, label: "Build CV", icon: FileText },
  { id: PAGES.COVER_LETTER, label: "Build Cover Letter", icon: EnvelopeSimple },
];

export default function Navbar({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(id) {
    onNavigate(id);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(PAGES.HOME)}
          className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Jobify — go to home"
        >
          <Logo />
        </button>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} isActive={item.id === page} onSelect={navigate} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer md:hidden"
          >
            {menuOpen ? (
              <X size={20} weight="regular" aria-hidden="true" />
            ) : (
              <List size={20} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Primary"
          className="border-t border-border/70 bg-background px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.id} item={item} isActive={item.id === page} onSelect={navigate} fullWidth />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ item, isActive, onSelect, fullWidth = false }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        fullWidth ? "w-full" : ""
      } ${isActive ? "bg-primary text-primary-fg" : "text-foreground hover:bg-muted"}`}
    >
      <Icon size={17} weight="regular" aria-hidden="true" />
      {item.label}
    </button>
  );
}
