import { Container } from "./Container";
import { ui } from "@/lib/i18n/ui";

export function PlaceholderPage({ title, locale = "th" }: { title: string; locale?: string }) {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
      <p className="text-slate-500">{ui(locale, "comingSoon")}</p>
    </Container>
  );
}
