import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-murdoch-red">404</p>
      <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Page not found</h1>
      <p className="max-w-md text-foreground-muted">
        The page you are looking for does not exist or may have moved.
      </p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </Container>
  );
}
