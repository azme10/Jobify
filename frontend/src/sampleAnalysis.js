export const sampleAnalysis = {
  keyword_match_pct: 62.4,
  seniority_level: "Mid",
  clarity_score: 71,
  impact_verb_score: 48,
  formatting_flags: [
    "Inconsistent date format across roles",
    "Missing quantified results in 2 bullets",
  ],
  overall_score: 64,
  requirement_matches: [
    {
      requirement: "Production Python experience",
      status: "covered",
      evidence: "\"Built internal tools using Python and PostgreSQL\" at Beta Inc (2018-2021).",
      importance: "must-have",
    },
    {
      requirement: "FastAPI or similar async web framework",
      status: "partial",
      evidence: "FastAPI appears in the skills list, but no role or project shows it in use.",
      importance: "must-have",
    },
    {
      requirement: "Owning backend services end to end",
      status: "covered",
      evidence: "\"Worked on backend services for the payments platform\" at Acme Corp.",
      importance: "must-have",
    },
    {
      requirement: "Payments domain knowledge",
      status: "covered",
      evidence: "Two years on a payments platform at Acme Corp.",
      importance: "nice-to-have",
    },
    {
      requirement: "Cloud infrastructure (AWS/GCP)",
      status: "partial",
      evidence: "AWS is listed under skills with no supporting project or responsibility.",
      importance: "must-have",
    },
    {
      requirement: "CI/CD pipeline ownership",
      status: "covered",
      evidence: "\"Maintained CI/CD pipelines for the engineering team\" at Beta Inc.",
      importance: "nice-to-have",
    },
    {
      requirement: "Kubernetes / container orchestration",
      status: "missing",
      evidence: "No mention of Kubernetes, ECS, or any orchestration platform anywhere in the CV.",
      importance: "nice-to-have",
    },
    {
      requirement: "Observability and incident response",
      status: "missing",
      evidence: "No monitoring, alerting, or on-call experience described.",
      importance: "must-have",
    },
  ],
  missing_keywords: [
    "Kubernetes",
    "observability",
    "incident response",
    "microservices",
    "async",
    "load testing",
    "infrastructure as code",
  ],
  rewrite_suggestions: [
    {
      original: "Responsible for managing the customer support team",
      improved: "Led a 6-person support team, cutting average ticket resolution time from 18h to 6h",
      reason: "Replaces a passive, vague phrase with a strong action verb and a quantified outcome.",
    },
    {
      original: "Worked on backend services for the payments platform",
      improved: "Built and shipped 4 backend services for a payments platform processing $2M/month",
      reason: "\"Worked on\" is a weak verb; \"built and shipped\" signals ownership and impact.",
    },
    {
      original: "Helped improve the onboarding flow",
      improved: "Redesigned the onboarding flow, increasing activation rate by 23% in 3 months",
      reason: "Quantifies the contribution instead of using the vague verb \"helped\".",
    },
  ],
};
