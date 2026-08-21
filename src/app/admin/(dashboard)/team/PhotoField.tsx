"use client";

import { useRef, useState } from "react";
import { inputClasses } from "@/components/admin/form";
import { TEAM_PHOTO_MAX_BYTES, TEAM_PHOTO_MIME_TYPES } from "@/lib/storage/team-photos";

// Two fields are always in the DOM at once: the file input (name=
// "photoFile") and the original URL text input (name="photoUrl"), just
// with one hidden via CSS depending on `mode`. That keeps ordinary HTML
// form semantics doing the work server-side (see withUploadedPhoto() in
// ./actions.ts) — "leave the current photo alone", "replace it with an
// upload", "replace it with a pasted URL", and "clear it" all fall out of
// what actually got submitted, no extra client/server coordination needed.
export function PhotoField({ currentPhotoUrl }: { currentPhotoUrl?: string | null }) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl ?? null);
  const [urlValue, setUrlValue] = useState(currentPhotoUrl ?? "");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    setFileError(null);
    if (!file) return;
    if (!TEAM_PHOTO_MIME_TYPES.includes(file.type as (typeof TEAM_PHOTO_MIME_TYPES)[number])) {
      setFileError("Photo must be a PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > TEAM_PHOTO_MAX_BYTES) {
      setFileError("Photo must be 5MB or smaller.");
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPreview(null);
    setUrlValue("");
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Photo (optional)</span>
        <button
          type="button"
          onClick={() => setMode(mode === "upload" ? "url" : "upload")}
          className="text-xs font-medium text-teal hover:text-foreground"
        >
          {mode === "upload" ? "Paste a URL instead" : "Upload a photo instead"}
        </button>
      </div>

      {preview && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob:/arbitrary preview, not a served content image */}
          <img src={preview} alt="" className="h-16 w-16 rounded-xl border border-border object-cover" />
          <button type="button" onClick={clearPhoto} className="text-xs font-medium text-coral hover:text-murdoch-red">
            Remove photo
          </button>
        </div>
      )}

      <div className={mode === "upload" ? "block" : "hidden"}>
        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-surface-raised px-4 py-8 text-center text-sm transition-colors hover:border-murdoch-red/60"
        >
          <span className="text-foreground-muted">Drag a photo here, or click to browse</span>
          <span className="text-xs text-muted">PNG, JPEG, WebP or GIF — up to 5MB</span>
          <input
            ref={fileInputRef}
            type="file"
            name="photoFile"
            accept={TEAM_PHOTO_MIME_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <input
        type="url"
        name="photoUrl"
        value={urlValue}
        onChange={(event) => {
          setUrlValue(event.target.value);
          setPreview(event.target.value || null);
        }}
        placeholder="https://…"
        className={`${inputClasses} ${mode === "upload" ? "hidden" : ""}`}
      />

      {fileError && (
        <p role="alert" className="text-sm text-coral">
          {fileError}
        </p>
      )}
    </div>
  );
}
