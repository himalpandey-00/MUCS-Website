import Image from "next/image";
import Link from "next/link";

const CREST_SRC = "/brand/mucs-crest.png";

type LogoProps = {
  /** Pixel size of the crest image. */
  size?: number;
  /** Show the "MURDOCH CYBER SECURITY CLUB" wordmark next to the crest.
   *  The crest itself has the club name in its ring, but that's illegible
   *  at nav/footer sizes, so the wordmark carries legibility there. */
  wordmark?: boolean;
  /** Wrap in a link to the homepage. Disable when already inside one. */
  asLink?: boolean;
  className?: string;
};

/**
 * The single source of truth for the MUCS crest across the site — header,
 * footer, and (via app/icon.tsx, app/apple-icon.tsx, app/opengraph-image.tsx)
 * the favicon and social preview image all render this same asset.
 *
 * The crest is used as supplied: never stretched, recoloured, cropped, or
 * redrawn. It already renders correctly on both light and dark surfaces
 * since it's a self-contained circular badge.
 */
export function Logo({ size = 40, wordmark = true, asLink = true, className }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Image
        src={CREST_SRC}
        alt="Murdoch Cyber Security Club crest"
        width={size}
        height={size}
        priority
        className="rounded-full"
        style={{ width: size, height: size }}
      />
      {wordmark && (
        <span className="font-heading font-extrabold uppercase leading-tight text-foreground">
          <span className="block text-sm sm:text-base">Murdoch</span>
          <span className="block text-[11px] sm:text-xs tracking-[0.08em] text-foreground-muted">
            Cyber Security Club
          </span>
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label="MUCS home" className="shrink-0">
      {content}
    </Link>
  );
}
