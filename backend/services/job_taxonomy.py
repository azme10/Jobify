from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from services.embeddings import embed_texts

JOB_TAXONOMY = [
    ("Backend Engineer", "Designs and builds server-side APIs, databases, and distributed systems."),
    ("Frontend Engineer", "Builds user-facing web interfaces with modern JavaScript frameworks."),
    ("Full-Stack Engineer", "Works across both frontend and backend of web applications."),
    ("Data Scientist", "Analyzes data and builds statistical and machine learning models."),
    ("Data Engineer", "Builds data pipelines and infrastructure for analytics and ML."),
    ("Machine Learning Engineer", "Designs, trains, and deploys machine learning models in production."),
    ("DevOps Engineer", "Automates deployment, infrastructure, and CI/CD pipelines."),
    ("Site Reliability Engineer", "Ensures uptime, performance, and scalability of production systems."),
    ("Mobile Engineer (iOS)", "Builds native iOS applications in Swift."),
    ("Mobile Engineer (Android)", "Builds native Android applications in Kotlin."),
    ("QA / Test Engineer", "Designs and automates tests to ensure software quality."),
    ("Security Engineer", "Identifies and mitigates security vulnerabilities in systems."),
    ("Product Manager", "Defines product strategy and coordinates cross-functional delivery."),
    ("Project Manager", "Plans and coordinates project timelines, resources, and stakeholders."),
    ("UX/UI Designer", "Designs user flows, wireframes, and visual interfaces."),
    ("Product Designer", "Owns end-to-end product design from research to visual polish."),
    ("Technical Writer", "Writes documentation, guides, and API references."),
    ("Solutions Architect", "Designs technical solutions and system architecture for clients."),
    ("Engineering Manager", "Leads and mentors a team of software engineers."),
    ("Business Analyst", "Analyzes business processes and translates needs into requirements."),
    ("Sales Engineer", "Provides technical expertise to support sales of technical products."),
    ("Customer Success Manager", "Ensures customers achieve value from a product and stay retained."),
    ("Marketing Manager", "Plans and executes marketing campaigns and strategy."),
    ("Growth Marketer", "Runs data-driven experiments to drive user acquisition and retention."),
    ("Content Strategist", "Plans and creates content across channels to support brand goals."),
    ("Financial Analyst", "Analyzes financial data to support business decisions."),
    ("Accountant", "Manages financial records, reporting, and compliance."),
    ("HR / People Operations", "Manages recruiting, onboarding, and employee relations."),
    ("Recruiter", "Sources and hires candidates for open roles."),
    ("Operations Manager", "Oversees day-to-day business operations and process improvement."),
    ("Supply Chain Analyst", "Optimizes logistics, inventory, and supplier relationships."),
    ("Graphic Designer", "Creates visual assets for branding, marketing, and products."),
    ("Video Editor", "Edits and produces video content for marketing or media."),
    ("Data Analyst", "Turns raw data into dashboards and actionable business insights."),
    ("Cloud Engineer", "Designs and manages cloud infrastructure on AWS, GCP, or Azure."),
    ("Database Administrator", "Manages, tunes, and secures production databases."),
]

_titles = [t for t, _ in JOB_TAXONOMY]
_descriptions = [d for _, d in JOB_TAXONOMY]
_taxonomy_embeddings = embed_texts(_descriptions)


def recommend_jobs(cv_text: str, top_n: int = 5) -> list[dict]:
    cv_embedding = embed_texts([cv_text])[0]
    scores = cosine_similarity([cv_embedding], _taxonomy_embeddings)[0]
    ranked = sorted(zip(_titles, _descriptions, scores), key=lambda x: x[2], reverse=True)
    return [
        {
            "title": title,
            "description": description,
            "match_pct": round(float(np.clip(score, 0, 1)) * 100, 1),
        }
        for title, description, score in ranked[:top_n]
    ]
