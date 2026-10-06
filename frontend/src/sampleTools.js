export const sampleInterviewQuestions = [
  "Walk me through a time you had to debug a production incident under pressure.",
  "This role emphasizes API design — describe how you approached a recent API you built.",
  "Your CV shows a move from an IC role toward leading others — what was hardest about that shift?",
  "The job description mentions payments experience — what's the trickiest edge case you've handled?",
  "How do you decide when to build a service in-house versus buying a third-party solution?",
];

export const sampleInterviewFeedback = {
  score: 78,
  strengths: [
    "Concrete example with a measurable outcome",
    "Clear structure (situation, action, result)",
  ],
  improvements: [
    "Mention the team size and your specific role in the decision",
    "Quantify the time or cost saved",
  ],
  model_answer:
    "In my last role, our checkout API started throwing 500s during a flash sale. I traced it to a bad deploy that had gone out an hour earlier, so I rolled it back immediately to stop the bleeding, then dug into the logs to confirm the root cause before re-deploying with a fix and an added canary check. The incident lasted under 10 minutes end to end, and I wrote up a short postmortem so we'd catch that class of bug in CI going forward.",
};

export const sampleJobRecommendations = [
  {
    title: "Backend Engineer",
    description: "Designs and builds server-side APIs, databases, and distributed systems.",
    match_pct: 88.2,
  },
  {
    title: "Full-Stack Engineer",
    description: "Works across both frontend and backend of web applications.",
    match_pct: 74.5,
  },
  {
    title: "Solutions Architect",
    description: "Designs technical solutions and system architecture for clients.",
    match_pct: 61.3,
  },
  {
    title: "Engineering Manager",
    description: "Leads and mentors a team of software engineers.",
    match_pct: 58.9,
  },
  {
    title: "DevOps Engineer",
    description: "Automates deployment, infrastructure, and CI/CD pipelines.",
    match_pct: 55.1,
  },
];

export const sampleCoverLetter = `Dear Hiring Manager,

I'm writing to apply for the Backend Engineer role on your team. In my current position, I led a 6-person support engineering effort and built four backend services for a payments platform processing $2M/month — experience that maps directly onto the API and reliability work described in your posting.

What draws me to this role specifically is the emphasis on ownership: I've shipped services end-to-end, from design through on-call, and I care as much about the operational story as the initial build. I'd welcome the chance to bring that same rigor to your platform team.

I'd be glad to walk through any of this in more detail.

Best,
Candidate`;

export const sampleLatexCv = String.raw`\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[colorlinks = true, linkcolor = red, urlcolor = blue, citecolor = blue, anchorcolor = blue]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{fontawesome5}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.6in}
\addtolength{\textwidth}{1.19in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.4in}
\raggedbottom\raggedright
\titleformat{\section}{\vspace{-3pt}\scshape\raggedright\large\bfseries}{}{0em}{}[\titlerule \vspace{-5pt}]

\begin{document}
\begin{center}
    \textbf{\Huge Jordan Lee} \\[9pt]
    {\fontsize{14}{32}\selectfont \textit{Backend Engineer}} \\[5pt]
    \small{\faPhone\ (555) 123-4567 \quad \textbar \quad \href{mailto:jordan.lee@example.com}{\faEnvelope\ jordan.lee@example.com}}
\end{center}

\section{Profile}
  \small{Backend engineer with 5+ years building scalable APIs and payments infrastructure, now targeting Backend Engineer roles with FastAPI and Python.}

\section{Education}
{\bf B.S. Computer Science}, State University \textbf{\hfill {2014 - 2018}}\\

\section{Experience}
\textbf{Senior Support Engineer - Acme Corp \hfill 2021 - 2024}
\begin{itemize}[leftmargin=0.15in, label=$\bullet$]
\item Led a 6-person support team, cutting average ticket resolution time from 18h to 6h
\item Built and shipped 4 backend services for a payments platform processing \$2M/month
\end{itemize}
\textit{KEYWORDS:} Python, FastAPI, PostgreSQL, Docker, AWS

\textbf{Software Engineer - Beta Inc \hfill 2018 - 2021}
\begin{itemize}[leftmargin=0.15in, label=$\bullet$]
\item Built internal tools using Python and PostgreSQL
\item Maintained CI/CD pipelines for the engineering team
\end{itemize}
\textit{KEYWORDS:} Python, PostgreSQL, CI/CD

\section{Skills}
\begin{tabular}{ @{} >{\bfseries}l @{\hspace{6ex}} l }
Programming Languages & Python, FastAPI, PostgreSQL\\
Tools & Docker, AWS, REST APIs\\
\end{tabular}

\end{document}
`;

export const sampleBiasFlags = [
  {
    phrase: "young and energetic team",
    category: "Age",
    suggestion: "collaborative, high-energy team",
  },
  {
    phrase: "native English speaker required",
    category: "Nationality / Language",
    suggestion: "fluent in written and spoken English",
  },
];

export const sampleProjectKeywords = [
  {
    name: "Jobify",
    suggested_keywords: ["AWS", "CI/CD pipelines", "Docker", "microservices"],
    reason:
      "The project uses Python and FastAPI but doesn't mention cloud deployment or CI/CD, both called out in the job description.",
  },
  {
    name: "Task Tracker CLI",
    suggested_keywords: ["unit testing", "SQL", "CLI design"],
    reason:
      "Adding testing and data-layer keywords would better align this project with the role's emphasis on reliable, well-tested backend services.",
  },
];
