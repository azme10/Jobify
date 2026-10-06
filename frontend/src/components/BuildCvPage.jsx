import { useId, useState } from "react";
import { Plus, Trash, Code, ImageSquare } from "@phosphor-icons/react";
import CopyButton from "./CopyButton";
import InlineSpinner from "./InlineSpinner";
import ErrorBanner from "./ErrorBanner";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { buildCv } from "../api";

const emptyEducation = () => ({ degree: "", school: "", dates: "", note: "" });
const emptyExperience = () => ({ title: "", company: "", dates: "", bulletsText: "" });
const emptyProject = () => ({ name: "", technologies: "", bulletsText: "" });

const DEFAULT_SKILL_CATEGORIES = ["Frontend", "Web", "AI", "Soft Skills"];

function updateAt(list, index, patch) {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function removeAt(list, index) {
  return list.filter((_, i) => i !== index);
}

function toBullets(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function BuildCvPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [summary, setSummary] = useState("");
  const [includePhoto, setIncludePhoto] = useState(false);
  const [photoFilename, setPhotoFilename] = useState("photo.jpg");

  const [education, setEducation] = useState([emptyEducation()]);
  const [experience, setExperience] = useState([emptyExperience()]);
  const [projects, setProjects] = useState([emptyProject()]);
  const [skills, setSkills] = useState(DEFAULT_SKILL_CATEGORIES.map((category) => ({ category, items: "" })));
  const [awardsText, setAwardsText] = useState("");

  const [latex, setLatex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { copied, copy } = useCopyToClipboard();

  const photoFieldId = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name,
        title,
        phone,
        email,
        linkedin,
        github,
        summary,
        include_photo: includePhoto,
        photo_filename: photoFilename,
        education: education.filter((entry) => entry.degree || entry.school),
        experience: experience
          .filter((entry) => entry.title || entry.company)
          .map(({ bulletsText, ...rest }) => ({ ...rest, bullets: toBullets(bulletsText) })),
        projects: projects
          .filter((entry) => entry.name)
          .map(({ bulletsText, ...rest }) => ({ ...rest, bullets: toBullets(bulletsText) })),
        skills: Object.fromEntries(
          skills.filter((s) => s.category && s.items).map((s) => [s.category, s.items])
        ),
        awards: toBullets(awardsText),
      };
      const data = await buildCv(payload);
      setLatex(data.latex);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Build CV</h1>
      <p className="mt-2 text-sm text-muted-fg">
        Type in your details and get a polished CV back as ready-to-compile LaTeX source — no AI
        rewriting, just your information laid out in a proven template.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-fg">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} required />
            <Field label="Title / role" value={title} onChange={setTitle} placeholder="Software Engineer" />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/you" />
            <Field label="GitHub" value={github} onChange={setGithub} placeholder="github.com/you" />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">Profile / summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              placeholder="A short summary of who you are and what you're targeting."
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={includePhoto}
                onChange={(e) => setIncludePhoto(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <ImageSquare size={16} weight="regular" aria-hidden="true" />
              Include a circular photo header
            </label>
            {includePhoto && (
              <div className="flex items-center gap-2">
                <label htmlFor={photoFieldId} className="text-xs text-muted-fg">
                  Image filename
                </label>
                <input
                  id={photoFieldId}
                  value={photoFilename}
                  onChange={(e) => setPhotoFilename(e.target.value)}
                  className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
          </div>
          {includePhoto && (
            <p className="mt-2 text-xs text-muted-fg">
              Place an image with this exact filename next to the .tex file when you compile it.
            </p>
          )}
        </section>

        <ListSection
          title="Education"
          items={education}
          onAdd={() => setEducation([...education, emptyEducation()])}
          onRemove={(i) => setEducation(removeAt(education, i))}
          renderItem={(entry, i) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Degree" value={entry.degree} onChange={(v) => setEducation(updateAt(education, i, { degree: v }))} />
              <Field label="School" value={entry.school} onChange={(v) => setEducation(updateAt(education, i, { school: v }))} />
              <Field label="Dates" value={entry.dates} onChange={(v) => setEducation(updateAt(education, i, { dates: v }))} placeholder="2021 -- 2024" />
              <Field label="Note (optional)" value={entry.note} onChange={(v) => setEducation(updateAt(education, i, { note: v }))} />
            </div>
          )}
        />

        <ListSection
          title="Experience"
          items={experience}
          onAdd={() => setExperience([...experience, emptyExperience()])}
          onRemove={(i) => setExperience(removeAt(experience, i))}
          renderItem={(entry, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Title" value={entry.title} onChange={(v) => setExperience(updateAt(experience, i, { title: v }))} />
                <Field label="Company" value={entry.company} onChange={(v) => setExperience(updateAt(experience, i, { company: v }))} />
                <Field label="Dates" value={entry.dates} onChange={(v) => setExperience(updateAt(experience, i, { dates: v }))} placeholder="Jun 2023 -- Aug 2023" />
              </div>
              <BulletsField
                label="Bullet points (one per line)"
                value={entry.bulletsText}
                onChange={(v) => setExperience(updateAt(experience, i, { bulletsText: v }))}
              />
            </div>
          )}
        />

        <ListSection
          title="Projects"
          items={projects}
          onAdd={() => setProjects([...projects, emptyProject()])}
          onRemove={(i) => setProjects(removeAt(projects, i))}
          renderItem={(entry, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={entry.name} onChange={(v) => setProjects(updateAt(projects, i, { name: v }))} />
                <Field label="Technologies" value={entry.technologies} onChange={(v) => setProjects(updateAt(projects, i, { technologies: v }))} placeholder="React, FastAPI" />
              </div>
              <BulletsField
                label="Bullet points (one per line)"
                value={entry.bulletsText}
                onChange={(v) => setProjects(updateAt(projects, i, { bulletsText: v }))}
              />
            </div>
          )}
        />

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">Skills</h2>
            <button
              type="button"
              onClick={() => setSkills([...skills, { category: "", items: "" }])}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline cursor-pointer"
            >
              <Plus size={14} weight="regular" aria-hidden="true" />
              Add category
            </button>
          </div>
          <div className="space-y-3">
            {skills.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.category}
                  onChange={(e) => setSkills(updateAt(skills, i, { category: e.target.value }))}
                  placeholder="Category"
                  className="w-36 shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <input
                  value={s.items}
                  onChange={(e) => setSkills(updateAt(skills, i, { items: e.target.value }))}
                  placeholder="Comma-separated skills"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  aria-label="Remove category"
                  onClick={() => setSkills(removeAt(skills, i))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-fg transition-colors hover:bg-muted hover:text-destructive cursor-pointer"
                >
                  <Trash size={15} weight="regular" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-fg">Awards (optional)</h2>
          <BulletsField label="One per line" value={awardsText} onChange={setAwardsText} />
        </section>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <Code size={16} weight="regular" aria-hidden="true" />
          Generate LaTeX CV
        </button>
      </form>

      {loading && <InlineSpinner label="Assembling your CV…" />}
      {error && <ErrorBanner message={error} onRetry={handleSubmit} />}

      {latex && !loading && (
        <div className="relative mt-6 animate-fade-up">
          <CopyButton
            copied={copied}
            onClick={() => copy(latex)}
            label="LaTeX source"
            className="absolute right-3 top-3 rounded-md border border-border bg-card px-2 py-1 hover:text-foreground"
          />
          <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-muted/50 p-4 pr-16 font-mono text-xs leading-relaxed text-card-fg">
            {latex}
          </pre>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}

function BulletsField({ label, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        placeholder={"Built X using Y, resulting in Z\nLed a team of..."}
      />
    </div>
  );
}

function ListSection({ title, items, onAdd, onRemove, renderItem }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline cursor-pointer"
        >
          <Plus size={14} weight="regular" aria-hidden="true" />
          Add
        </button>
      </div>
      <div className="space-y-5">
        {items.map((entry, i) => (
          <div key={i} className="relative rounded-xl border border-border/70 bg-background/60 p-4">
            {items.length > 1 && (
              <button
                type="button"
                aria-label={`Remove ${title.toLowerCase()} entry`}
                onClick={() => onRemove(i)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-muted hover:text-destructive cursor-pointer"
              >
                <Trash size={14} weight="regular" aria-hidden="true" />
              </button>
            )}
            {renderItem(entry, i)}
          </div>
        ))}
      </div>
    </section>
  );
}
