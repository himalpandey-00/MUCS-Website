import { notFound } from "next/navigation";

// Catches any unmatched path under the public site (e.g. a typo'd URL) so
// it renders nested inside (public)/layout.tsx — with Header/Footer — via
// src/app/not-found.tsx, rather than falling through to the bare root
// not-found boundary that /admin's unmatched paths use.
export default function CatchAll(): never {
  notFound();
}
