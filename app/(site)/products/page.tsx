import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "สินค้า",
  description: "ผลิตภัณฑ์ของ Millimed BFS",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    include: { image: true },
  });

  if (products.length === 0) {
    return <PlaceholderPage title="สินค้า" />;
  }

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">สินค้า</h1>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
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
                <div className="flex h-full items-center justify-center text-xs text-slate-300">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-slate-400">{product.sku}</p>
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                {product.nameTh}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
