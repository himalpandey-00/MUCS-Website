export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  /** e.g. "reveal" to fade the heading in on scroll (see globals.css). */
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-base text-foreground-muted sm:text-lg">{description}</p>}
    </div>
  );
}
