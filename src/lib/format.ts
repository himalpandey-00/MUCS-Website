const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Australia/Perth",
});

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Australia/Perth",
});

export function formatEventDate(date: Date) {
  return dateFormatter.format(date);
}

// Same day formatter, reused for non-event dates (e.g. AdminUser.lastSignInAt
// on the Staff & Access page) that don't need the time component.
export function formatShortDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatEventTime(date: Date) {
  return timeFormatter.format(date).replace(":00", "");
}

export function formatEventRange(startsAt: Date, endsAt: Date | null) {
  const day = formatEventDate(startsAt);
  const start = formatEventTime(startsAt);
  if (!endsAt) return `${day} · ${start}`;
  return `${day} · ${start}–${formatEventTime(endsAt)}`;
}
