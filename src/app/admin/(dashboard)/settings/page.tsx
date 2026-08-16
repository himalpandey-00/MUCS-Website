import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage() {
  const rows = await prisma.siteSetting.findMany();
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Site settings</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Contact info, meeting details, and social links shown in the site footer.
        </p>
      </div>
      <SettingsForm values={values} />
    </div>
  );
}
