# MUCS Website

Public website for the **Murdoch Cyber Security Club** — Next.js (App
Router) + TypeScript + Tailwind CSS, with Postgres (hosted on Supabase) via
Prisma.

**Phase 1 scope**: public site only — Home, About, Team, Events (list +
detail), News (list + detail), Contact. Content for events, committee
members, news, and announcements is DB-backed (editable via the DB, not
hardcoded). No auth, payments, ticketing, or member dashboard yet.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- PostgreSQL on Supabase, via Prisma 7 (driver-adapter based — see below)
- Deployment target: Vercel

## Local setup (Windows / PowerShell)

```powershell
npm install
copy .env.example .env
# fill in .env with your Supabase connection strings (see below)
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Before considering any change "done":

```powershell
npx tsc --noEmit
npm run build
```

## Environment variables

See [.env.example](.env.example). You need two Supabase Postgres
connection strings (Project Settings → Database → Connection string):

| Variable       | Connection | Port | Used by                                   |
| -------------- | ---------- | ---- | ------------------------------------------ |
| `DATABASE_URL` | Pooled (Supavisor) | 6543 | App runtime (`src/lib/prisma.ts`) |
| `DIRECT_URL`   | Direct     | 5432 | Prisma CLI — migrate/seed/studio (`prisma.config.ts`) |

### Why two URLs, and why a driver adapter?

Prisma 7 removed `url`/`directUrl` from `datasource` in `schema.prisma`.
Connection info now lives in `prisma.config.ts` (used by the CLI for
migrations) and the app constructs `PrismaClient` explicitly with a driver
adapter (`@prisma/adapter-pg`) at runtime — see `src/lib/prisma.ts`. This is
a real architecture change from "classic" Prisma and from what a lot of
existing tutorials describe; if you're following older Prisma docs, the
`url =` / `directUrl =` schema syntax no longer works on this version.

The two-URL split itself isn't new: migrations need a direct, non-pooled
connection (session-level features like advisory locks that PgBouncer/
Supavisor's transaction-mode pooling doesn't support), while the app should
use the pooled connection for efficiency.

## Design tokens

Colours, fonts, and spacing are CSS variables in
[src/app/globals.css](src/app/globals.css), mapped into Tailwind via
`@theme` (Tailwind v4 is CSS-config, not `tailwind.config.ts`). The palette
is provisional (see the build brief) — retune it in one place there.

The MUCS crest is a single asset at `public/brand/mucs-crest.png`, used via
one `<Logo>` component (`src/components/Logo.tsx`) everywhere: header,
footer, favicon (`src/app/icon.tsx`), and the OG image
(`src/app/opengraph-image.tsx`). It is never stretched, recoloured,
cropped, or redrawn.

## Data model

`prisma/schema.prisma`: `Event`, `TeamMember`, `NewsArticle`,
`Announcement`, `SiteSetting`, `ContactSubmission`. Kept independent from
future Phase 2+ entities (`User`, `Registration`, `Ticket`, `Donation`,
`Sponsor`) so those can be added without reshaping what's here.

`prisma/seed.ts` seeds the real committee (President/VP/Treasurer as
supplied) plus clearly-placeholder demo events, news, announcements, and
site settings (contact email, meeting time, socials) — replace those
before launch.

## What's stubbed / needs a decision before Phase 2

- **Auth**: not implemented. Brief prefers Supabase Auth over Auth.js —
  needs explicit confirmation before building.
- **Image hosting**: Phase 1 has no upload UI, so `TeamMember.photoUrl` /
  event & article cover images are plain URLs with no CMS to set them
  (edit via the DB directly, or add real photos to `public/` and point the
  URL there). No Supabase Storage wiring yet.
- **Contact submissions**: stored in `ContactSubmission` via a validated
  server action — nothing reads them yet beyond direct DB/Supabase Studio
  access. No email notification.
