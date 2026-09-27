// The club's social profiles: which platforms the site supports, where each
// link is stored (a SiteSetting key, edited under Admin → Settings), and the
// rule every link must pass before it's saved or shown. Pure functions, no
// server/client-only imports — used by the settings action, the footer and
// contact page, and tests/social.test.ts.

export type SocialIconName = "instagram" | "discord" | "linkedin" | "github" | "tiktok" | "youtube" | "facebook";

export type SocialPlatform = {
  /** SiteSetting key the link is stored under. */
  key: string;
  name: string;
  icon: SocialIconName;
  /** Allowed hostnames; subdomains (www., m., au. …) are allowed too. */
  hosts: string[];
  example: string;
};

// Display order in the footer and on the contact page.
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "instagram_url", name: "Instagram", icon: "instagram", hosts: ["instagram.com"], example: "https://www.instagram.com/yourclub" },
  { key: "discord_url", name: "Discord", icon: "discord", hosts: ["discord.gg", "discord.com"], example: "https://discord.gg/invite-code" },
  { key: "linkedin_url", name: "LinkedIn", icon: "linkedin", hosts: ["linkedin.com"], example: "https://www.linkedin.com/company/yourclub" },
  { key: "github_url", name: "GitHub", icon: "github", hosts: ["github.com"], example: "https://github.com/yourclub" },
  { key: "tiktok_url", name: "TikTok", icon: "tiktok", hosts: ["tiktok.com"], example: "https://www.tiktok.com/@yourclub" },
  { key: "youtube_url", name: "YouTube", icon: "youtube", hosts: ["youtube.com", "youtu.be"], example: "https://www.youtube.com/@yourclub" },
  { key: "facebook_url", name: "Facebook", icon: "facebook", hosts: ["facebook.com", "fb.com"], example: "https://www.facebook.com/yourclub" },
];

export type SocialUrlCheck = { ok: true; value: string } | { ok: false; error: string };

/**
 * Empty is fine (the platform is just hidden). Otherwise it must be a full
 * https:// link on that platform's own domain — so a typo, a plain handle,
 * an `http:`/`javascript:` link, or a look-alike domain never becomes a
 * clickable link on the site.
 */
export function checkSocialUrl(platform: SocialPlatform, input: string): SocialUrlCheck {
  const value = input.trim();
  if (value === "") return { ok: true, value };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: `Enter the full link, starting with https:// — e.g. ${platform.example}` };
  }
  if (url.protocol !== "https:") {
    return { ok: false, error: `The link must start with https:// — e.g. ${platform.example}` };
  }
  if (url.username || url.password) {
    return { ok: false, error: "That link has a username or password in it — use the plain profile link." };
  }
  const host = url.hostname.toLowerCase();
  if (!platform.hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
    return {
      ok: false,
      error: `That isn't a ${platform.name} link — it should be on ${platform.hosts.join(" or ")}.`,
    };
  }
  return { ok: true, value };
}

/** The platforms that have a valid link in `settings`, in display order. */
export function socialLinksFromSettings(settings: Record<string, string>) {
  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const check = checkSocialUrl(platform, settings[platform.key] ?? "");
    return check.ok && check.value ? [{ platform, href: check.value }] : [];
  });
}
