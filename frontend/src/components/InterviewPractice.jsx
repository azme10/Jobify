import { useState } from "react";
import { CaretDown, ChatCircleText, Sparkle } from "@phosphor-icons/react";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useDemoFetch } from "../hooks/useDemoFetch";
import { fetchInterviewQuestions, submitInterviewAnswer } from "../api";
import { sampleInterviewQuestions, sampleInterviewFeedback } from "../sampleTools";

export default function InterviewPractice({ cvInput, jobDescription, isDemo }) {
  const { data: questions, loading, error } = useDemoFetch(
    () => fetchInterviewQuestions(cvInput, jobDescription).then((d) => d.questions),
    sampleInterviewQuestions,
    isDemo,
    [cvInput, jobDescription, isDemo]
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState(null);
  const [feedbackError, setFeedbackError] = useState({});

  async function handleGetFeedback(index, question) {
    setFeedbackLoading(index);
    setFeedbackError((prev) => ({ ...prev, [index]: null }));
    try {
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 500));
        setFeedback((prev) => ({ ...prev, [index]: sampleInterviewFeedback }));
      } else {
        const result = await submitInterviewAnswer(question, answers[index] || "", jobDescription);
        setFeedback((prev) => ({ ...prev, [index]: result }));
      }
    } catch (err) {
      setFeedbackError((prev) => ({ ...prev, [index]: err.message }));
    } finally {
      setFeedbackLoading(null);
    }
  }

  if (loading) return <InlineSpinner label="Generating tailored interview questions…" />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-fg">
        Practice answering questions tailored to your CV and this role. Type your answer, then
        get feedback.
      </p>
      <ul className="space-y-3">
        {questions.map((q, i) => {
          const isOpen = activeIndex === i;
          const canSubmit = Boolean((answers[i] || "").trim());
          return (
            <li key={i} className="rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setActiveIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <span className="flex items-start gap-2.5 text-sm font-medium text-card-fg">
                  <ChatCircleText
                    size={18}
                    weight="regular"
                    className="mt-0.5 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  {q}
                </span>
                <CaretDown
                  size={16}
                  weight="regular"
                  className={`mt-0.5 shrink-0 text-muted-fg transition-transform motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-border px-4 py-4 animate-fade-up">
                  <textarea
                    value={answers[i] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                    placeholder="Type your answer…"
                    rows={4}
                    className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => handleGetFeedback(i, q)}
                    disabled={!canSubmit || feedbackLoading === i}
                    className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-fg transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {feedbackLoading === i ? "Scoring…" : "Get feedback"}
                  </button>

                  {feedbackError[i] && <ErrorBanner message={feedbackError[i]} />}

                  {feedback[i] && (
                    <div className="rounded-lg bg-muted/60 p-4 animate-scale-in">
                      <p className="mb-2 text-sm font-semibold text-foreground">
                        Score: <span className="tabular-nums">{feedback[i].score}</span> / 100
                      </p>
                      {feedback[i].strengths?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-accent">Strengths</p>
                          <ul className="list-inside list-disc text-sm text-card-fg">
                            {feedback[i].strengths.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feedback[i].improvements?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-warning">Improve</p>
                          <ul className="list-inside list-disc text-sm text-card-fg">
                            {feedback[i].improvements.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feedback[i].model_answer && (
                        <div className="mt-3 rounded-lg border border-accent/25 bg-accent/5 p-3">
                          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-accent">
                            <Sparkle size={13} weight="fill" aria-hidden="true" />
                            Example strong answer
                          </p>
                          <p className="text-sm text-card-fg">{feedback[i].model_answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
