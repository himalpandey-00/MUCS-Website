export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-murdoch-red/40 bg-accent-soft px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-coral">
      {children}
    </span>
  );
}
