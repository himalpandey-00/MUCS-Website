// The fixed set of SiteSetting keys the public site actually reads (see
// src/components/Footer.tsx and the contact page). SiteSetting is a generic
// key/value table in the schema, but the admin editor only exposes the keys
// something on the site consumes — adding a new one used elsewhere means
// adding it here too. Social links are listed separately, in
// src/lib/social.ts's SOCIAL_PLATFORMS, because each one is validated
// against its platform's domain before it's saved.
export const KNOWN_SETTING_KEYS: { key: string; label: string; hint?: string }[] = [
  { key: "contact_email", label: "Contact email" },
  { key: "meeting_schedule", label: "Meeting schedule", hint: "e.g. Thursdays, 6:00pm" },
  { key: "meeting_location", label: "Meeting location" },
  { key: "campus_address", label: "Campus address" },
];
