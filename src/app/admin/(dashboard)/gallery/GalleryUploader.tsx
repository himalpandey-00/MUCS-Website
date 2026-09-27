"use client";

import { useRef, useState } from "react";
import { inputClasses } from "@/components/admin/form";
import { ImagePrepError, prepareImageForUpload } from "@/lib/images/prepare-upload";
import { uploadGalleryPhoto } from "./actions";

type ItemStatus = "queued" | "preparing" | "uploading" | "done" | "failed";
type Item = { key: string; name: string; status: ItemStatus; error?: string };

const STATUS_LABELS: Record<ItemStatus, string> = {
  queued: "Waiting",
  preparing: "Resizing…",
  uploading: "Uploading…",
  done: "Uploaded",
  failed: "Failed",
};

const STATUS_STYLES: Record<ItemStatus, string> = {
  queued: "text-foreground-muted",
  preparing: "text-foreground-muted",
  uploading: "text-foreground-muted",
  done: "text-teal",
  failed: "text-coral",
};

// Picks or drag-and-drops any number of photos, then for each one in turn:
// shrink it in the browser (src/lib/images/prepare-upload.ts), send it to
// uploadGalleryPhoto, and show how it went. One photo per request, so a big
// batch never hits Vercel's 4.5 MB request limit, and one bad file doesn't
// stop the rest.
export function GalleryUploader() {
  const [items, setItems] = useState<Item[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(key: string, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function uploadAll(files: File[]) {
    if (files.length === 0 || busy) return;
    const batchId = Date.now();
    const batch: Item[] = files.map((file, index) => ({ key: `${batchId}-${index}`, name: file.name, status: "queued" }));
    setItems(batch);
    setBusy(true);

    for (const [index, file] of files.entries()) {
      const { key } = batch[index];
      try {
        update(key, { status: "preparing" });
        const prepared = await prepareImageForUpload(file);

        update(key, { status: "uploading" });
        const formData = new FormData();
        formData.append("photo", prepared);
        if (caption.trim()) formData.append("caption", caption.trim());
        const result = await uploadGalleryPhoto(formData);

        update(key, result.ok ? { status: "done" } : { status: "failed", error: result.error });
      } catch (error) {
        const message = error instanceof ImagePrepError ? error.message : "Upload failed — try again.";
        update(key, { status: "failed", error: message });
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const doneCount = items.filter((item) => item.status === "done").length;
  const failedCount = items.filter((item) => item.status === "failed").length;

  return (
    <section aria-labelledby="gallery-upload-heading" className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <h2 id="gallery-upload-heading" className="font-heading text-lg font-bold">
        Upload photos
      </h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="gallery-caption" className="text-sm font-medium text-foreground">
          Caption (optional)
        </label>
        <input
          id="gallery-caption"
          type="text"
          maxLength={200}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="e.g. picoCTF team night, Sept 2026"
          className={inputClasses}
          disabled={busy}
        />
        <p className="text-xs text-foreground-muted">
          Applied to every photo in this upload — describe what&apos;s in the photos (it&apos;s also what screen
          readers announce). You can edit each photo&apos;s caption afterwards.
        </p>
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadAll(Array.from(event.dataTransfer.files ?? []));
        }}
        className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed bg-surface-raised px-4 py-10 text-center text-sm transition-colors ${
          busy ? "cursor-wait opacity-70" : "cursor-pointer hover:border-murdoch-red/60"
        } ${dragging ? "border-murdoch-red" : "border-border"}`}
      >
        <span className="font-medium text-foreground">
          {busy ? "Uploading…" : "Drag photos here, or click to choose"}
        </span>
        <span className="text-xs text-muted">
          JPEG, PNG, WebP or GIF · several at once is fine · resized automatically
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(event) => void uploadAll(Array.from(event.target.files ?? []))}
        />
      </label>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <p role="status" className="text-sm text-foreground-muted">
            {busy
              ? `Uploading ${doneCount + failedCount + 1} of ${items.length}…`
              : `${doneCount} uploaded${failedCount > 0 ? `, ${failedCount} failed` : ""}.`}
          </p>
          <ul className="flex max-h-64 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2">
                <span className="min-w-0 truncate text-foreground" title={item.name}>
                  {item.name}
                </span>
                <span className={`text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                  {STATUS_LABELS[item.status]}
                  {item.error ? ` — ${item.error}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
