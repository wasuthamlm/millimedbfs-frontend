import Image from "next/image";
import Link from "next/link";
import { productPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";

export type ProductCardData = {
  id: string;
  sku: string;
  slug: string | null;
  nameTh: string;
  image: { url: string } | null;
  category: { slug: string } | null;
};

export function ProductGrid({ products, locale }: { products: ProductCardData[]; locale: string }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={localePath(locale, productPath(product))}
          className="overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square w-full bg-slate-50">
            {product.image ? (
              <Image
                src={product.image.url}
                alt={product.nameTh}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-300">ไม่มีรูปภาพ</div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs text-slate-400">{product.sku}</p>
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.nameTh}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export const PRODUCT_CARD_SELECT = {
  id: true,
  sku: true,
  slug: true,
  nameTh: true,
  image: { select: { url: true } },
  category: { select: { slug: true } },
} as const;
