"use client";

import { useEffect, useRef, useState } from "react";
import { inputClasses } from "@/components/admin/form";
import { ImagePrepError, prepareImageForUpload } from "@/lib/images/prepare-upload";

// Two fields are always in the DOM at once: the file input (name=
// "photoFile") and the original URL text input (name="photoUrl"), just
// with one hidden via CSS depending on `mode`. That keeps ordinary HTML
// form semantics doing the work server-side (see withUploadedPhoto() in
// ./actions.ts) — "leave the current photo alone", "replace it with an
// upload", "replace it with a pasted URL", and "clear it" all fall out of
// what actually got submitted, no extra client/server coordination needed.
//
// A picked or dropped photo is shrunk in the browser first (src/lib/images/
// prepare-upload.ts) and the *resized* file is what gets put into the file
// input — so a 12 MB phone photo uploads as ~1 MB and never trips Vercel's
// 4.5 MB request limit.
export function PhotoField({ currentPhotoUrl }: { currentPhotoUrl?: string | null }) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl ?? null);
  const [urlValue, setUrlValue] = useState(currentPhotoUrl ?? "");
  const [fileError, setFileError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Release the last blob: preview URL when this field goes away.
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  function showPreview(url: string | null, isObjectUrl: boolean) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = isObjectUrl ? url : null;
    setPreview(url);
  }

  function clearFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(file: File | null) {
    setFileError(null);
    // Never leave the raw original in the input: until the resized copy is
    // ready (or if resizing fails), submitting the form sends no file.
    clearFileInput();
    if (!file) return;

    setPreparing(true);
    try {
      const prepared = await prepareImageForUpload(file);
      const transfer = new DataTransfer();
      transfer.items.add(prepared);
      if (fileInputRef.current) fileInputRef.current.files = transfer.files;
      showPreview(URL.createObjectURL(prepared), true);
    } catch (error) {
      setFileError(error instanceof ImagePrepError ? error.message : "Couldn't read that image.");
    } finally {
      setPreparing(false);
    }
  }

  function clearPhoto() {
    showPreview(null, false);
    setUrlValue("");
    setFileError(null);
    clearFileInput();
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
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed bg-surface-raised px-4 py-8 text-center text-sm transition-colors hover:border-murdoch-red/60 ${
            dragging ? "border-murdoch-red" : "border-border"
          }`}
        >
          <span className="text-foreground-muted">
            {preparing ? "Preparing photo…" : "Drag a photo here, or click to browse"}
          </span>
          <span className="text-xs text-muted">JPEG, PNG, WebP or GIF — resized automatically</span>
          <input
            ref={fileInputRef}
            type="file"
            name="photoFile"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <input
        type="url"
        name="photoUrl"
        value={urlValue}
        onChange={(event) => {
          setUrlValue(event.target.value);
          showPreview(event.target.value || null, false);
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
