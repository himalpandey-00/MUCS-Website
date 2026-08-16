"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { KNOWN_SETTING_KEYS } from "./keys";

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// Only writes the fixed set of keys the public site actually reads (see
// keys.ts) — arbitrary extra form fields are ignored rather than trusted,
// since this still runs through requireAdmin() but there's no reason to
// let the form shape decide what rows exist.
export async function updateSettings(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  await requireAdmin();

  try {
    await prisma.$transaction(
      KNOWN_SETTING_KEYS.map(({ key }) => {
        const value = String(formData.get(key) ?? "").trim();
        return prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      })
    );
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { status: "error", message: "Something went wrong saving settings." };
  }

  revalidatePath("/admin/settings");
  // Footer (which reads these) renders on every page under the public
  // route group — revalidate that whole subtree, not just "/".
  revalidatePath("/", "layout");
  return { status: "success", message: "Settings saved." };
}
