import { Tag } from "./Tag";

export function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Tag>{kicker}</Tag>
      <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-base text-foreground-muted sm:text-lg">{description}</p>}
    </div>
  );
}
