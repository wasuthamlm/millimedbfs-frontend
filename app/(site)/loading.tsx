import { Container } from "@/components/ui/Container";

export default function SiteLoading() {
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
    </Container>
  );
}
