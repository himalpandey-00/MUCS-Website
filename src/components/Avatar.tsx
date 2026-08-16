import Image from "next/image";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, photoUrl, size = 96 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="aspect-square rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className="flex aspect-square items-center justify-center rounded-xl bg-surface-raised font-heading text-2xl font-extrabold text-muted"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  );
}
