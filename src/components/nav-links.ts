// The public site's main navigation — one list shared by the header (desktop
// and mobile menus) and the footer, so adding a page means changing it once.
export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;
