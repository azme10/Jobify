import { useState } from "react";
import {
  Gauge,
  PencilSimple,
  ChatCircleText,
  Briefcase,
  EnvelopeSimple,
  Scales,
  Tag,
  Code,
} from "@phosphor-icons/react";
import ScorecardView from "./ScorecardView";
import RewritePanel from "./RewritePanel";
import InterviewPractice from "./InterviewPractice";
import JobRecommendations from "./JobRecommendations";
import CoverLetterGenerator from "./CoverLetterGenerator";
import BiasChecker from "./BiasChecker";
import ProjectKeywords from "./ProjectKeywords";
import LatexCvGenerator from "./LatexCvGenerator";

const SECTIONS = [
  {
    group: "Results",
    items: [
      { id: "overview", label: "Overview", icon: Gauge },
      { id: "suggestions", label: "Rewrite Suggestions", icon: PencilSimple },
    ],
  },
  {
    group: "Go deeper",
    items: [
      { id: "interview", label: "Interview Practice", icon: ChatCircleText },
      { id: "jobs", label: "Job Matches", icon: Briefcase },
      { id: "cover-letter", label: "Cover Letter", icon: EnvelopeSimple },
      { id: "bias", label: "Bias Check", icon: Scales },
      { id: "project-keywords", label: "Project Keywords", icon: Tag },
      { id: "latex-cv", label: "LaTeX CV", icon: Code },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((section) => section.items);

// Overview and Suggestions already render their own card-based layout (score
// ring, breakdown cards, diff cards). Wrapping them in another card here would
// double-box them, unlike the plain tool panels below, which need the wrapper.
const RICH_CONTENT_IDS = new Set(["overview", "suggestions"]);

export default function ResultsDashboard({ result, cvInput, jobDescription, isDemo }) {
  const [activeId, setActiveId] = useState("overview");
  const active = ALL_ITEMS.find((item) => item.id === activeId) ?? ALL_ITEMS[0];
  const hasSuggestions = (result.rewrite_suggestions?.length ?? 0) > 0;

  const toolProps = { cvInput, jobDescription, isDemo };

  return (
    <div className="md:flex md:items-start md:gap-8">
      <nav
        aria-label="Results navigation"
        className="mb-6 md:sticky md:top-24 md:mb-0 md:w-56 md:flex-none md:self-start"
      >
        {/* Mobile: horizontally scrollable pill strip. Desktop: grouped vertical list. */}
        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {ALL_ITEMS.map((item) => (
            <NavPill key={item.id} item={item} isActive={item.id === activeId} onSelect={setActiveId} />
          ))}
        </div>

        <div className="hidden md:block md:space-y-5">
          {SECTIONS.map((section) => (
            <div key={section.group}>
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-fg">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavRow key={item.id} item={item} isActive={item.id === activeId} onSelect={setActiveId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <h2 className="mb-4 text-base font-semibold text-foreground">{active.label}</h2>

        {RICH_CONTENT_IDS.has(activeId) ? (
          <div key={activeId} className="animate-fade-up">
            {activeId === "overview" && <ScorecardView result={result} />}
            {activeId === "suggestions" &&
              (hasSuggestions ? (
                <RewritePanel suggestions={result.rewrite_suggestions} />
              ) : (
                <p className="text-sm text-muted-fg">No rewrite suggestions for this CV.</p>
              ))}
          </div>
        ) : (
          <div
            key={activeId}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 animate-fade-up"
          >
            {activeId === "interview" && <InterviewPractice {...toolProps} />}
            {activeId === "jobs" && <JobRecommendations {...toolProps} />}
            {activeId === "cover-letter" && <CoverLetterGenerator {...toolProps} />}
            {activeId === "bias" && <BiasChecker {...toolProps} />}
            {activeId === "project-keywords" && <ProjectKeywords {...toolProps} />}
            {activeId === "latex-cv" && <LatexCvGenerator {...toolProps} />}
          </div>
        )}
      </div>
    </div>
  );
}

function NavPill({ item, isActive, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isActive
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      <Icon size={16} weight="regular" aria-hidden="true" />
      {item.label}
    </button>
  );
}

function NavRow({ item, isActive, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
      className={`flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isActive ? "bg-primary text-primary-fg" : "text-foreground hover:bg-muted"
      }`}
    >
      <Icon size={16} weight="regular" aria-hidden="true" />
      {item.label}
    </button>
  );
}
