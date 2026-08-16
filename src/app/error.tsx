"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-murdoch-red">Error</p>
      <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Something went wrong</h1>
      <p className="max-w-md text-foreground-muted">
        Please try again. If the problem persists, contact the committee.
      </p>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
