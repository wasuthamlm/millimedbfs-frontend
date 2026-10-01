import Link from "next/link";
import { ui, type UiKey } from "@/lib/i18n/ui";

export type SocialFloatItem = {
  key: "line-official-account" | "facebook-messenger";
  link: string;
};

const LABELS: Record<SocialFloatItem["key"], UiKey> = {
  "line-official-account": "chatLine",
  "facebook-messenger": "chatMessenger",
};

const COLORS: Record<SocialFloatItem["key"], string> = {
  "line-official-account": "bg-[#06C755] hover:bg-[#05b34c]",
  "facebook-messenger": "bg-[#0084FF] hover:bg-[#0070d9]",
};

export function SocialFloatButtons({ items, locale = "th" }: { items: SocialFloatItem[]; locale?: string }) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ui(locale, LABELS[item.key])}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors ${COLORS[item.key]}`}
        >
          <span className="text-xs font-bold">
            {item.key === "line-official-account" ? "LINE" : "FB"}
          </span>
        </Link>
      ))}
    </div>
  );
}
