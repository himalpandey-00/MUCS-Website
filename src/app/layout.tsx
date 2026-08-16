import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Every page reads content straight from the DB (events, team, news,
// announcements, site settings via <Footer>) and none of that goes through
// Next's fetch() cache, so Next has no signal to treat these routes as
// dynamic on its own — left alone it prerenders them once at build time,
// which would mean DB edits (new events, committee changes, a toggled
// announcement) silently don't appear until the next deploy. Forcing the
// whole tree dynamic here keeps "content lives in the DB, not the code" true.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Murdoch Cyber Security Club",
    template: "%s · MUCS",
  },
  description:
    "MUCS is a student-led cybersecurity club at Murdoch University — workshops, CTFs, and a network of people who work in the field.",
  openGraph: {
    type: "website",
    siteName: "Murdoch Cyber Security Club",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-murdoch-red focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
