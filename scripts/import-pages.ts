// One-off import of the real Page Manager content list (from Page_export.csv,
// deduped against soft/permanently-deleted rows and one exact duplicate slug)
// into both the Supabase primary DB and the local backup DB.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PageStatus } from "../lib/generated/prisma/client";

type PageSeed = {
  slug: string;
  titleTh: string;
  titleEn: string;
  status: PageStatus;
  seoTitle?: string;
  seoDesc?: string;
};

const PAGES: PageSeed[] = [
  {
    slug: "home",
    titleTh: "หน้าแรก",
    titleEn: "Home",
    status: "PUBLISHED",
    seoTitle: "หน้าแรก | Millimed BFS",
    seoDesc: "บริษัท มิลลิเมด บีเอฟเอส จำกัด ผู้ผลิตยาคุณภาพสูง",
  },
  { slug: "about", titleTh: "เกี่ยวกับเรา", titleEn: "About Us", status: "PUBLISHED", seoTitle: "เกี่ยวกับเรา | Millimed BFS" },
  { slug: "contact", titleTh: "ติดต่อเรา", titleEn: "Contact Us", status: "PUBLISHED", seoTitle: "ติดต่อเรา | Millimed BFS" },
  { slug: "article", titleTh: "บทความ", titleEn: "Article", status: "PUBLISHED" },
  { slug: "bfs", titleTh: "อาคาร BFS", titleEn: "BFS Building", status: "PUBLISHED", seoTitle: "อาคาร BFS | Millimed BFS" },
  {
    slug: "center_lab_building",
    titleTh: "อาคาร CENTER LAB BUILDING",
    titleEn: "Tablet Building",
    status: "PUBLISHED",
    seoTitle: "อาคาร TABLET | Millimed BFS",
  },
  {
    slug: "OSD_building",
    titleTh: "อาคาร OSD BUILDING",
    titleEn: "R&D Building",
    status: "PUBLISHED",
    seoTitle: "อาคาร R&D | Millimed BFS",
  },
  { slug: "automated_warehouse", titleTh: "อาคาร Automated Warehouse", titleEn: "Automated Warehouse", status: "PUBLISHED" },
  { slug: "hormone", titleTh: "อาคาร HORMONE", titleEn: "Hormone Building", status: "PUBLISHED", seoTitle: "อาคาร HORMONE | Millimed BFS" },
  {
    slug: "Weerachai_Building",
    titleTh: "อาคาร Weerachai High Tech",
    titleEn: "Weerachai High Tech Building",
    status: "PUBLISHED",
  },
  { slug: "weerachai_high_tech", titleTh: "อาคาร Weerachai High Tech", titleEn: "Weerachai High Tech", status: "DRAFT" },
  {
    slug: "manufacturing/office",
    titleTh: "อาคารสำนักงาน",
    titleEn: "Office Building",
    status: "DRAFT",
    seoTitle: "อาคารสำนักงาน | Millimed BFS",
  },
  {
    slug: "manufacturing-standards",
    titleTh: "มาตรฐานผู้ผลิต",
    titleEn: "Manufacturing Standards",
    status: "PUBLISHED",
    seoTitle: "มาตรฐานผู้ผลิต | Millimed BFS",
  },
  { slug: "product/eye-drops", titleTh: "ผลิตภัณฑ์กลุ่มน้ำตาเทียม/ยาหยอดตา", titleEn: "Artificial Tears / Eye Drops", status: "PUBLISHED" },
  { slug: "drug-information/artificial-tears", titleTh: "เอกสารกำกับยากลุ่มน้ำตาเทียม", titleEn: "Artificial Tears Drug Info", status: "PUBLISHED" },
  { slug: "drug-information/capsule", titleTh: "เอกสารกำกับยากลุ่มยาแคปซูล", titleEn: "Capsule Drug Info", status: "PUBLISHED" },
  { slug: "drug-information/tablet", titleTh: "เอกสารกำกับยากลุ่มยาเม็ด", titleEn: "Tablet Drug Info", status: "PUBLISHED" },
  { slug: "product/hormone", titleTh: "ผลิตภัณฑ์กลุ่มยาฮอร์โมน", titleEn: "Hormone Products", status: "PUBLISHED" },
  { slug: "drug-information", titleTh: "เอกสารกำกับยา", titleEn: "Drug Information", status: "PUBLISHED" },
  { slug: "drug-information/powder", titleTh: "เอกสารกำกับยากลุ่มยาผง", titleEn: "Powder Drug Info", status: "PUBLISHED" },
  { slug: "drug-information/lozenge", titleTh: "เอกสารกำกับยากลุ่มลูกอม", titleEn: "Lozenge Drug Info", status: "PUBLISHED" },
  { slug: "product/tablet", titleTh: "ผลิตภัณฑ์กลุ่มยาเม็ด", titleEn: "Tablet Products", status: "PUBLISHED" },
  { slug: "csr-and-event", titleTh: "CSR and EVENT", titleEn: "CSR and EVENT", status: "PUBLISHED", seoTitle: "CSR and EVENT | Millimed BFS" },
  { slug: "product/eye-medicine-info", titleTh: "ข้อมูลผลิตภัณฑ์ประเภทกลุ่มยาตา", titleEn: "Eye Medicine Product Info", status: "PUBLISHED" },
  { slug: "drug-information/hormone", titleTh: "เอกสารกำกับยากลุ่มยาฮอร์โมน", titleEn: "Hormone Drug Info", status: "PUBLISHED" },
  { slug: "product", titleTh: "Product", titleEn: "Product", status: "PUBLISHED", seoTitle: "ผลิตภัณฑ์ | Millimed BFS" },
  { slug: "drug-information/eye-drops", titleTh: "เอกสารกำกับยากลุ่มยาหยอดตา", titleEn: "Eye Drops Drug Info", status: "PUBLISHED" },
  { slug: "manufacturing", titleTh: "Manufacturing", titleEn: "Manufacturing", status: "PUBLISHED", seoTitle: "การผลิต | Millimed BFS" },
];

async function importInto(label: string, connectionString: string | undefined) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  let created = 0;
  let updated = 0;

  for (const page of PAGES) {
    const existing = await prisma.page.findUnique({ where: { slug: page.slug } });
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        status: page.status,
        seoTitle: page.seoTitle ?? null,
        seoDesc: page.seoDesc ?? null,
      },
      create: {
        slug: page.slug,
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        status: page.status,
        seoTitle: page.seoTitle ?? null,
        seoDesc: page.seoDesc ?? null,
      },
    });
    if (existing) updated++;
    else created++;
  }

  console.log(`[${label}] created ${created}, updated ${updated}, total ${PAGES.length}`);
  await prisma.$disconnect();
}

async function main() {
  await importInto("primary/Supabase", process.env.DATABASE_URL);
  await importInto("local", process.env.LOCAL_DATABASE_URL);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
