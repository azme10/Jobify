import { useEffect, useRef, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import UploadPanel from "./components/UploadPanel";
import LoadingState from "./components/LoadingState";
import ErrorBanner from "./components/ErrorBanner";
import ResultsDashboard from "./components/ResultsDashboard";
import Navbar, { PAGES } from "./components/Navbar";
import HomePage from "./components/HomePage";
import BuildCvPage from "./components/BuildCvPage";
import CoverLetterPage from "./components/CoverLetterPage";
import LandingSection from "./components/LandingSection";
import Footer from "./components/Footer";
import { analyzeCV } from "./api";
import { sampleAnalysis } from "./sampleAnalysis";

function pageFromHash() {
  const hash = window.location.hash.replace("#", "");
  return Object.values(PAGES).includes(hash) ? hash : PAGES.HOME;
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastArgs, setLastArgs] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.focus();
    }
  }, [result]);

  useEffect(() => {
    function onHashChange() {
      setPage(pageFromHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(id) {
    window.location.hash = id;
    setPage(id);
  }

  async function runAnalysis(cvInput, jobDescription) {
    setLastArgs({ cvInput, jobDescription });
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeCV(cvInput, jobDescription);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (lastArgs) runAnalysis(lastArgs.cvInput, lastArgs.jobDescription);
  }

  function handleViewSample() {
    setError(null);
    setResult(sampleAnalysis);
  }

  function handleStartOver() {
    setResult(null);
    setError(null);
    setLastArgs(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar page={page} onNavigate={navigate} />

      {page === PAGES.HOME && <HomePage onNavigate={navigate} />}

      {page === PAGES.ANALYZE && (
        <>
          {/* lastArgs (not just result) gates the landing layout: it's set the instant an
              analysis starts, so a re-analysis from the compact view never flashes back
              to the big landing hero while the request is in flight. Once a result exists,
              the upload form is hidden entirely — "New analysis" is what brings it back. */}
          {!result && !lastArgs ? (
            <LandingSection onAnalyze={runAnalysis} onViewSample={handleViewSample} />
          ) : !result ? (
            <main className="mx-auto max-w-3xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(79,70,229,0.35)] sm:p-8">
                <UploadPanel onAnalyze={runAnalysis} onViewSample={handleViewSample} disabled={loading} />
              </div>

              <div className="mt-6 space-y-6">
                {error && <ErrorBanner message={error} onRetry={lastArgs ? handleRetry : undefined} />}
                {loading && <LoadingState />}
              </div>
            </main>
          ) : (
            <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 flex justify-end">
              <button
                type="button"
                onClick={handleStartOver}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
              >
                <Plus size={15} weight="regular" aria-hidden="true" />
                New analysis
              </button>
            </div>
          )}

          {result && (
            <div
              ref={resultsRef}
              tabIndex={-1}
              className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12 outline-none sm:px-6"
            >
              <ResultsDashboard
                result={result}
                cvInput={lastArgs?.cvInput}
                jobDescription={lastArgs?.jobDescription}
                isDemo={!lastArgs}
              />
            </div>
          )}
        </>
      )}

      {page === PAGES.BUILD_CV && <BuildCvPage />}
      {page === PAGES.COVER_LETTER && <CoverLetterPage />}

      <Footer />
    </div>
  );
}
