import { Tag, FolderSimple } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useDemoFetch } from "../hooks/useDemoFetch";
import { fetchProjectKeywords } from "../api";
import { sampleProjectKeywords } from "../sampleTools";

export default function ProjectKeywords({ cvInput, jobDescription, isDemo }) {
  const { data: projects, loading, error } = useDemoFetch(
    () => fetchProjectKeywords(cvInput, jobDescription).then((d) => d.projects),
    sampleProjectKeywords,
    isDemo,
    [cvInput, jobDescription, isDemo]
  );

  if (loading) return <InlineSpinner label="Reading your projects section…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-fg">
        Keywords from the job description that are missing from your listed projects.
      </p>

      {projects.length === 0 ? (
        <p className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-fg">
          <FolderSimple size={18} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
          No distinct projects section was found in this CV. This tool works best when your CV
          lists specific personal, academic, or open-source projects.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {projects.map((p) => (
            <li key={p.name} className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-sm font-semibold text-card-fg">{p.name}</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {p.suggested_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary"
                  >
                    <Tag size={12} weight="regular" aria-hidden="true" />
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-fg">{p.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
