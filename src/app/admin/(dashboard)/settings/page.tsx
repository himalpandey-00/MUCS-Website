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
          Contact info and meeting details shown in the footer and on the Contact page, plus the club&apos;s
          social links (shown as icons).
        </p>
      </div>
      <SettingsForm values={values} />
    </div>
  );
}
