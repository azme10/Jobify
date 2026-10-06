import { useId, useRef, useState } from "react";
import { UploadSimple, FileText, X, Code } from "@phosphor-icons/react";

const MAX_SIZE_MB = 10;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Shared PDF-upload / paste-text control for CV input, used by both the
// Analyze flow and the Cover Letter builder. Reports the current value up via
// onChange as { file } | { text } | null (null while empty or invalid).
export default function CvInputField({ onChange, label = "CV / Résumé" }) {
  const [inputMode, setInputMode] = useState("pdf");
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const cvTextFieldId = useId();
  const fileErrorId = useId();

  function validateAndSetFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are accepted.");
      onChange(null);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      onChange(null);
      return;
    }
    setFileError("");
    setCvFile(file);
    onChange({ file });
  }

  function handleTextChange(text) {
    setCvText(text);
    onChange(text.trim() ? { text: text.trim() } : null);
  }

  function switchMode(mode) {
    setInputMode(mode);
    setFileError("");
    if (mode === "pdf") onChange(cvFile ? { file: cvFile } : null);
    else onChange(cvText.trim() ? { text: cvText.trim() } : null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => switchMode("pdf")}
            className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
              inputMode === "pdf" ? "bg-card text-foreground shadow-sm" : "text-muted-fg"
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => switchMode("paste")}
            className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
              inputMode === "paste" ? "bg-card text-foreground shadow-sm" : "text-muted-fg"
            }`}
          >
            Paste LaTeX / text
          </button>
        </div>
      </div>

      {inputMode === "pdf" ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          aria-describedby={fileError ? fileErrorId : undefined}
          className={`group flex min-h-[144px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isDragging
              ? "border-secondary bg-secondary/5"
              : "border-border bg-muted/40 hover:border-secondary/60 hover:bg-muted"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          />

          {cvFile ? (
            <div className="flex w-full max-w-sm items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left animate-scale-in">
              <FileText size={22} weight="regular" className="shrink-0 text-secondary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-fg">{cvFile.name}</p>
                <p className="text-xs text-muted-fg">{formatFileSize(cvFile.size)}</p>
              </div>
              <button
                type="button"
                aria-label="Remove selected file"
                onClick={(e) => {
                  e.stopPropagation();
                  setCvFile(null);
                  onChange(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X size={16} weight="regular" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <UploadSimple size={28} weight="regular" className="text-muted-fg transition-colors group-hover:text-secondary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your CV here, or <span className="text-secondary">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-fg">PDF only, up to {MAX_SIZE_MB}MB</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor={cvTextFieldId} className="sr-only">
            Pasted CV source
          </label>
          <div className="flex min-h-[144px] flex-col rounded-xl border border-border bg-muted/40 p-1">
            <div className="flex items-center gap-1.5 px-3 pt-2 text-xs text-muted-fg">
              <Code size={13} weight="regular" aria-hidden="true" />
              LaTeX source or plain text — section commands help the AI read it more reliably
            </div>
            <textarea
              id={cvTextFieldId}
              value={cvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={"\\documentclass{article}\n...\n\nor just paste plain CV text"}
              rows={6}
              spellCheck={false}
              className="mt-1 flex-1 resize-y rounded-lg bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-fg focus-visible:outline-none"
            />
          </div>
        </div>
      )}
      {fileError && (
        <p id={fileErrorId} role="alert" className="mt-2 text-sm text-destructive">
          {fileError}
        </p>
      )}
    </div>
  );
}
