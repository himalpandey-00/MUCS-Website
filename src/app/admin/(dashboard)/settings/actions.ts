"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { SOCIAL_PLATFORMS, checkSocialUrl } from "@/lib/social";
import { KNOWN_SETTING_KEYS } from "./keys";

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  /** What was submitted, echoed back on error so the form keeps the admin's input. */
  values?: Record<string, string>;
};

const emailField = z.string().email();

// Only writes the fixed set of keys the public site actually reads (see
// keys.ts and SOCIAL_PLATFORMS) — arbitrary extra form fields are ignored
// rather than trusted. All-or-nothing: if any field is invalid, nothing is
// saved.
export async function updateSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  const values: Record<string, string> = {};
  const fieldErrors: Record<string, string[]> = {};

  for (const { key } of KNOWN_SETTING_KEYS) {
    values[key] = String(formData.get(key) ?? "").trim();
  }
  if (values.contact_email && !emailField.safeParse(values.contact_email).success) {
    fieldErrors.contact_email = ["Enter a valid email address."];
  }

  for (const platform of SOCIAL_PLATFORMS) {
    const submitted = String(formData.get(platform.key) ?? "");
    const check = checkSocialUrl(platform, submitted);
    if (check.ok) {
      values[platform.key] = check.value;
    } else {
      values[platform.key] = submitted.trim();
      fieldErrors[platform.key] = [check.error];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields — nothing was saved.", fieldErrors, values };
  }

  try {
    // Only write what actually changed — each write is a round trip to the
    // database, so saving all ~11 keys every time made a one-field edit take
    // several seconds.
    const saved = new Map((await prisma.siteSetting.findMany()).map((row) => [row.key, row.value]));
    const changed = Object.entries(values).filter(([key, value]) => saved.get(key) !== value);
    if (changed.length > 0) {
      await prisma.$transaction(
        changed.map(([key, value]) =>
          prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          })
        )
      );
    }
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { status: "error", message: "Something went wrong saving settings.", values };
  }

  revalidatePath("/admin/settings");
  // Footer (which reads these) renders on every page under the public
  // route group — revalidate that whole subtree, not just "/".
  revalidatePath("/", "layout");
  return { status: "success", message: "Settings saved." };
}
