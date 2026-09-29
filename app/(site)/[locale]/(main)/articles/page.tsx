import { permanentRedirect } from "next/navigation";
import { localePath } from "@/lib/i18n/locales";

// Articles now live under /news/:type (legacy URL scheme); "article" is the default type.
export default async function ArticlesRedirect({ params }: PageProps<"/[locale]/articles">) {
  const { locale } = await params;
  permanentRedirect(localePath(locale, "/news/article"));
}
