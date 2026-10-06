const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function postForm(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed. Please try again.");
  }

  return response.json();
}

async function postJson(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed. Please try again.");
  }

  return response.json();
}

// cvInput is { file: File } for an uploaded PDF or { text: string } for pasted
// LaTeX/plain-text CV source — exactly one of the two is ever set.
function appendCvInput(formData, cvInput) {
  if (cvInput?.text) {
    formData.append("cv_text", cvInput.text);
  } else {
    formData.append("cv_file", cvInput.file);
  }
}

export function analyzeCV(cvInput, jobDescription) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", jobDescription);
  return postForm("/analyze", formData);
}

export function fetchInterviewQuestions(cvInput, jobDescription) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", jobDescription);
  return postForm("/interview/questions", formData);
}

export function submitInterviewAnswer(question, answer, jobDescription) {
  const formData = new FormData();
  formData.append("question", question);
  formData.append("answer", answer);
  formData.append("job_description", jobDescription);
  return postForm("/interview/feedback", formData);
}

export function fetchJobRecommendations(cvInput) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  return postForm("/recommend-jobs", formData);
}

export function generateCoverLetter(cvInput, jobDescription, tone) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", jobDescription);
  formData.append("tone", tone);
  return postForm("/cover-letter", formData);
}

export function fetchBiasCheck(cvInput) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  return postForm("/bias-check", formData);
}

export function generateLatexCv(cvInput, jobDescription) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", jobDescription);
  return postForm("/generate-cv", formData);
}

export function fetchProjectKeywords(cvInput, jobDescription) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", jobDescription);
  return postForm("/project-keywords", formData);
}

export function buildCv(payload) {
  return postJson("/build-cv", payload);
}

export function generateFullCoverLetter(cvInput, fields) {
  const formData = new FormData();
  appendCvInput(formData, cvInput);
  formData.append("job_description", fields.jobDescription);
  formData.append("sender_name", fields.senderName);
  formData.append("recipient_name", fields.recipientName);
  formData.append("company_name", fields.companyName);
  formData.append("location", fields.location);
  formData.append("date", fields.date);
  formData.append("tone", fields.tone);
  return postForm("/full-cover-letter", formData);
}
