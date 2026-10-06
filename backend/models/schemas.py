from pydantic import BaseModel


class RewriteSuggestion(BaseModel):
    original: str
    improved: str
    reason: str


class RequirementMatch(BaseModel):
    requirement: str
    status: str  # covered | partial | missing
    evidence: str = ""
    importance: str = "must-have"


class AnalysisResponse(BaseModel):
    keyword_match_pct: float
    seniority_level: str
    clarity_score: int
    impact_verb_score: int
    requirement_matches: list[RequirementMatch] = []
    missing_keywords: list[str] = []
    formatting_flags: list[str]
    rewrite_suggestions: list[RewriteSuggestion]
    overall_score: int


class InterviewQuestionsResponse(BaseModel):
    questions: list[str]


class InterviewFeedbackResponse(BaseModel):
    score: int
    strengths: list[str]
    improvements: list[str]
    model_answer: str = ""


class JobRecommendation(BaseModel):
    title: str
    description: str
    match_pct: float


class JobRecommendationsResponse(BaseModel):
    recommendations: list[JobRecommendation]


class CoverLetterResponse(BaseModel):
    cover_letter: str
    latex: str = ""


class BiasFlag(BaseModel):
    phrase: str
    category: str
    suggestion: str


class BiasCheckResponse(BaseModel):
    flags: list[BiasFlag]


class LatexCvResponse(BaseModel):
    latex: str


class ProjectKeywordSuggestion(BaseModel):
    name: str
    suggested_keywords: list[str]
    reason: str


class ProjectKeywordsResponse(BaseModel):
    projects: list[ProjectKeywordSuggestion]


class EducationEntry(BaseModel):
    degree: str
    school: str
    dates: str = ""
    note: str = ""


class ExperienceEntry(BaseModel):
    title: str
    company: str
    dates: str = ""
    bullets: list[str] = []
    keywords: str = ""


class ProjectEntry(BaseModel):
    name: str
    technologies: str = ""
    bullets: list[str] = []


class ContributionEntry(BaseModel):
    heading: str
    dates: str = ""
    subtext: str = ""
    bullets: list[str] = []


class BuildCvRequest(BaseModel):
    name: str
    title: str = ""
    phone: str = ""
    email: str = ""
    linkedin: str = ""
    github: str = ""
    summary: str = ""
    include_photo: bool = False
    photo_filename: str = "photo.jpg"
    education: list[EducationEntry] = []
    experience: list[ExperienceEntry] = []
    projects: list[ProjectEntry] = []
    skills: dict[str, str] = {}
    contributions: list[ContributionEntry] = []
    awards: list[str] = []


