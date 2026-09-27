// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { SOCIAL_PLATFORMS, checkSocialUrl, socialLinksFromSettings } from "../src/lib/social";

const platform = (name: string) => {
  const found = SOCIAL_PLATFORMS.find((p) => p.name === name);
  if (!found) throw new Error(`no platform ${name}`);
  return found;
};

test("accepts real profile links, including subdomains", () => {
  const ok: [string, string][] = [
    ["Instagram", "https://www.instagram.com/murdochcyber"],
    ["Instagram", "https://instagram.com/murdochcyber/"],
    ["Discord", "https://discord.gg/abc123"],
    ["Discord", "https://discord.com/invite/abc123"],
    ["LinkedIn", "https://au.linkedin.com/company/mucs"],
    ["GitHub", "https://github.com/mucs"],
    ["TikTok", "https://www.tiktok.com/@mucs"],
    ["YouTube", "https://youtu.be/dQw4w9WgXcQ"],
    ["Facebook", "https://m.facebook.com/mucs"],
  ];
  for (const [name, url] of ok) {
    assert.deepEqual(checkSocialUrl(platform(name), url), { ok: true, value: url }, `${name}: ${url}`);
  }
});

test("empty means 'not set' and is allowed", () => {
  assert.deepEqual(checkSocialUrl(platform("Instagram"), "   "), { ok: true, value: "" });
});

test("trims surrounding whitespace", () => {
  assert.deepEqual(checkSocialUrl(platform("GitHub"), "  https://github.com/mucs  "), {
    ok: true,
    value: "https://github.com/mucs",
  });
});

test("rejects dangerous or wrong links", () => {
  const bad: [string, string][] = [
    ["Instagram", "javascript:alert(1)"],
    ["Instagram", "http://instagram.com/mucs"], // not https
    ["Instagram", "@mucs"], // a handle, not a link
    ["Instagram", "instagram.com/mucs"], // missing https://
    ["Instagram", "https://instagram.com.evil.example/mucs"], // look-alike domain
    ["Instagram", "https://notinstagram.com/mucs"], // suffix without a dot
    ["Discord", "https://discord.example.com/abc"],
    ["GitHub", "https://user:pass@github.com/mucs"],
    ["LinkedIn", "https://github.com/mucs"], // right format, wrong platform
    ["YouTube", "data:text/html,hi"],
  ];
  for (const [name, url] of bad) {
    assert.equal(checkSocialUrl(platform(name), url).ok, false, `${name} should reject ${url}`);
  }
});

test("socialLinksFromSettings keeps display order and skips empty or invalid links", () => {
  const links = socialLinksFromSettings({
    github_url: "https://github.com/mucs",
    instagram_url: "https://instagram.com/mucs",
    discord_url: "javascript:alert(1)",
    tiktok_url: "",
  });
  assert.deepEqual(
    links.map((link) => link.platform.name),
    ["Instagram", "GitHub"]
  );
});
