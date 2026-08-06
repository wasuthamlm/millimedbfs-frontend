import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { image: true },
  });
  if (!product || product.status !== "ACTIVE") return null;
  return product;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return {
    title: product.nameTh,
    description: product.descriptionTh ?? undefined,
    openGraph: product.image ? { images: [product.image.url] } : undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.nameTh}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-300">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">{product.sku}</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.nameTh}</h1>
        {product.nameEn && <p className="text-base text-slate-500">{product.nameEn}</p>}
        {product.descriptionTh && (
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
            {product.descriptionTh}
          </p>
        )}
      </div>
    </Container>
  );
}
