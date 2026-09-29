import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { PRODUCT_CARD_SELECT, ProductGrid } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "สินค้า",
  description: "ผลิตภัณฑ์ของ Millimed BFS",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({ params }: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    select: PRODUCT_CARD_SELECT,
  });

  if (products.length === 0) {
    return <PlaceholderPage title="สินค้า" />;
  }

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">สินค้า</h1>
      <ProductGrid products={products} locale={locale} />
    </Container>
  );
}
