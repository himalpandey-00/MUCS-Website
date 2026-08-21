import Image from "next/image";
import { TEAM_PHOTOS_BUCKET } from "@/lib/storage/team-photos";

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Only photos actually uploaded to our own Storage bucket go through
// next/image's Image Optimization API, which enforces next.config.ts's
// `images.remotePatterns` allow-list. An admin can still paste an
// arbitrary external URL via the team member form's "paste a URL instead"
// fallback — for a host that isn't allow-listed, next/image throws
// *synchronously*, which crashes the entire page (not just this avatar),
// not just skips rendering. `unoptimized` bypasses that pipeline and
// renders a plain <img> instead, so an unrecognized host degrades to "just
// shows the image" rather than "takes the page down."
export function isOwnBucketPhoto(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${TEAM_PHOTOS_BUCKET}/`);
}

export function Avatar({ name, photoUrl, size = 96 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized={!isOwnBucketPhoto(photoUrl)}
        className="aspect-square rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className="flex aspect-square items-center justify-center rounded-xl bg-surface-raised font-heading text-2xl font-extrabold text-muted"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  );
}
