import Image from "next/image";
import Link from "next/link";
import { productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui } from "@/lib/i18n/ui";

export type ProductCardData = {
  id: string;
  sku: string;
  slug: string | null;
  nameTh: string;
  nameEn?: string | null;
  price?: number | null;
  unit?: string | null;
  bestSeller?: boolean;
  image: { url: string } | null;
  category: { id?: string; slug: string; nameTh?: string; nameEn?: string | null } | null;
};

/** Product cards (legacy ProductCard): category, name, price + unit and the best-seller badge. */
export async function ProductGrid({ products, locale }: { products: ProductCardData[]; locale: string }) {
  const t = await loadLocalizer(locale, [
    ["PRODUCT", products.map((p) => p.id)],
    ["PRODUCT_CATEGORY", products.map((p) => p.category?.id)],
  ]);
  const numberFormat = new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US");

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => {
        const name = t("PRODUCT", product.id, "name", product.nameTh, product.nameEn);
        const category =
          product.category?.id && product.category.nameTh
            ? t("PRODUCT_CATEGORY", product.category.id, "name", product.category.nameTh, product.category.nameEn)
            : null;
        return (
          <Link
            key={product.id}
            href={localePath(locale, productPath(product))}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-site-bg">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-300">{ui(locale, "noImage")}</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
              {category && <p className="text-xs font-medium text-brand-navy">{category}</p>}
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</h3>
              {product.price != null && product.price > 0 && (
                <p className="text-sm font-bold text-brand-gold-dark">
                  {numberFormat.format(product.price)} {ui(locale, "baht")}
                  {product.unit && <span className="text-xs font-normal text-slate-400"> / {product.unit}</span>}
                </p>
              )}
              {product.bestSeller && (
                <span className="mt-1 w-fit rounded-md border border-brand-gold bg-brand-gold/10 px-2.5 py-0.5 text-xs font-semibold text-brand-gold-dark">
                  {ui(locale, "bestSeller")}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export const PRODUCT_CARD_SELECT = {
  id: true,
  sku: true,
  slug: true,
  nameTh: true,
  nameEn: true,
  price: true,
  unit: true,
  bestSeller: true,
  image: { select: { url: true } },
  category: { select: { id: true, slug: true, nameTh: true, nameEn: true } },
} as const;
