// Mirrors today's data/*.ts mock content into the database so the DB starts
// as a snapshot of what's already hardcoded (Step 0 of the migration plan).
// UI components keep reading from data/*.ts until each entity's Step 1
// read-path migration lands — this seed only makes the data available.
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type SectionType as PrismaSectionType } from "../lib/generated/prisma/client";

import { navLinks } from "../data/nav";
import { footerColumns, footerContact } from "../data/admin-footer";
import { banners } from "../data/admin-banners";
import { popupConfig } from "../data/admin-popup";
import { widgets } from "../data/admin-widgets";
import { homeSections } from "../data/admin-pages";

type SeedArticle = { slug: string; title: string; image: string; publishedAt: string; category?: string };
type SeedNewsItem = {
  slug: string;
  title: string;
  excerpt?: string;
  image: string;
  publishedAt: string;
  featured?: boolean;
};
type SeedProduct = { sku: string; name: string; status: "active" | "draft" | "archived" };

const articles: SeedArticle[] = [
  {
    slug: "cold-water-sore-throat",
    title: "เจ็บคอกินน้ำเย็นได้ไหม? ควรดื่มต่อหรือเปลี่ยนเป็นน้ำอุ่นดีกว่า",
    image: "/images/articles/cold-water-sore-throat.svg",
    publishedAt: "2025-06-02",
    category: "สุขภาพทั่วไป",
  },
  {
    slug: "birth-control-acne",
    title: "ยาคุมช่วยลดปัญหาสิวและรอบเดือนไม่สม่ำเสมอได้จริงไหม?",
    image: "/images/articles/birth-control-acne.svg",
    publishedAt: "2025-05-20",
    category: "สุขภาพผู้หญิง",
  },
  {
    slug: "sore-throat-medicine",
    title: "เจ็บคอกินยาอะไร? รวมวิธีบรรเทาตามอาการ กลืนแล้วเจ็บควรดูแลแบบไหน",
    image: "/images/articles/sore-throat-medicine.svg",
    publishedAt: "2025-05-10",
    category: "สุขภาพทั่วไป",
  },
  {
    slug: "eye-serum-redness",
    title: "ไฮยาเซรั่มใช้แล้วผิวแดงระคายเคืองเกิดจากอะไร? ต้องหยุดใช้ไหม",
    image: "/images/articles/eye-serum-redness.svg",
    publishedAt: "2025-04-28",
    category: "ผิวพรรณ",
  },
  {
    slug: "ear-nose-rinse",
    title: "ล้างจมูกแล้วหูอื้อ อย่าเพิ่งตกใจ อาจเกิดจากสาเหตุนี้",
    image: "/images/articles/ear-nose-rinse.svg",
    publishedAt: "2025-04-15",
    category: "สุขภาพทั่วไป",
  },
  {
    slug: "hyaluron-serum-vs-cream",
    title: "ไฮยาเซรั่มกับครีมไฮยา ต่างกันยังไง? เลือกใช้อันไหนดี",
    image: "/images/articles/hyaluron-serum-vs-cream.svg",
    publishedAt: "2025-04-02",
    category: "ผิวพรรณ",
  },
  {
    slug: "hyaluron-concentration",
    title: "ไฮยาลูรอนเข้มข้นแค่ไหนถึงช่วยให้ผิวชุ่มชื้นดี?",
    image: "/images/articles/hyaluron-concentration.svg",
    publishedAt: "2025-03-22",
    category: "ผิวพรรณ",
  },
  {
    slug: "dry-skin-serum",
    title: "ผิวแห้งสุดขีด ใช้ไฮยาเซรั่มอย่างเดียวพอไหม? ต้องเติมอะไรเพิ่ม",
    image: "/images/articles/dry-skin-serum.svg",
    publishedAt: "2025-03-10",
    category: "ผิวพรรณ",
  },
];

const newsItems: SeedNewsItem[] = [
  {
    slug: "expo-2025",
    title: "งาน อย. Expo ที่อิมแพค ชาเลนเจอร์ 2 เมืองทองธานี จัดขึ้น ณ วันที่ 23 - 25 กรกฎาคม 2568",
    excerpt:
      "Millimed BFS ร่วมออกบูธในงาน อย. Expo นำเสนอผลิตภัณฑ์ดูแลดวงตาและเวชภัณฑ์คุณภาพสูงแก่ผู้เข้าร่วมงาน",
    image: "/images/news/expo-2025.svg",
    publishedAt: "2025-07-25",
    featured: true,
  },
  {
    slug: "otc-symposium-2022",
    title: "งาน OTC Symposium and Thank you Party 18 ธันวาคม 2565",
    excerpt: "ขอบคุณพันธมิตรทางธุรกิจทุกท่านที่ร่วมงานสัมมนาและงานเลี้ยงขอบคุณประจำปี",
    image: "/images/news/otc-symposium-2022.svg",
    publishedAt: "2022-12-18",
  },
  {
    slug: "factory-open-day",
    title: "กิจกรรม Open Day เยี่ยมชมโรงงานผลิตมาตรฐานสากล",
    excerpt: "เปิดบ้านต้อนรับคู่ค้าและลูกค้าเข้าเยี่ยมชมกระบวนการผลิตที่ได้มาตรฐาน GMP",
    image: "/images/news/factory-open-day.svg",
    publishedAt: "2022-10-05",
  },
];

const adminProducts: SeedProduct[] = [
  { sku: "MBFS-001", name: "ไฮยาเซรั่ม อาย ดรอปส์", status: "active" },
  { sku: "MBFS-002", name: "เทตราเคน อาย ดรอปส์", status: "active" },
  { sku: "MBFS-003", name: "ไฮยา ครีม", status: "active" },
  { sku: "MBFS-004", name: "น้ำเกลือล้างจมูก", status: "active" },
  { sku: "MBFS-005", name: "อาร์ทิฟิเชียล เทียร์ส", status: "active" },
  { sku: "MBFS-006", name: "อายแคร์ เจล", status: "draft" },
  { sku: "MBFS-007", name: "สกินแคร์ เซรั่ม", status: "draft" },
  { sku: "MBFS-008", name: "มอยส์เจอร์ไรเซอร์", status: "active" },
  { sku: "MBFS-009", name: "ซันสกรีน เอสพีเอฟ 50", status: "archived" },
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function getOrCreateMedia(url: string, filename: string) {
  const existing = await prisma.media.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.media.create({
    data: { url, filename, mimeType: "image/svg+xml", size: 0 },
  });
}

const SECTION_TYPE_MAP: Record<string, PrismaSectionType> = {
  "hero-banners": "HERO_BANNERS",
  "cta-bar": "CTA_BAR",
  "company-intro": "COMPANY_INTRO",
  "latest-news": "LATEST_NEWS",
  articles: "ARTICLES",
};

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@millimedbfs.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Millimed Admin", role: "ADMIN", passwordHash },
  });

  console.log(`Seeded admin user: ${email} (change the password after first login)`);
}

async function seedNavLinks() {
  if (await prisma.navLink.count() > 0) return;
  for (let i = 0; i < navLinks.length; i++) {
    const link = navLinks[i];
    const parent = await prisma.navLink.create({
      data: { labelTh: link.label, href: link.href, order: i, placement: "HEADER" },
    });
    if (link.children) {
      for (let j = 0; j < link.children.length; j++) {
        const child = link.children[j];
        await prisma.navLink.create({
          data: {
            labelTh: child.label,
            href: child.href,
            order: j,
            placement: "HEADER",
            parentId: parent.id,
          },
        });
      }
    }
  }
}

async function seedFooter() {
  if ((await prisma.footerColumn.count()) === 0) {
    for (let i = 0; i < footerColumns.length; i++) {
      const col = footerColumns[i];
      const created = await prisma.footerColumn.create({
        data: { title: col.title, order: i },
      });
      for (let j = 0; j < col.links.length; j++) {
        const link = col.links[j];
        await prisma.footerLink.create({
          data: { columnId: created.id, label: link.label, href: link.href, order: j },
        });
      }
    }
  }

  await prisma.footerContact.upsert({
    where: { id: "singleton" },
    update: footerContact,
    create: { id: "singleton", ...footerContact },
  });
}

async function seedBanners() {
  if (await prisma.banner.count() > 0) return;
  for (let i = 0; i < banners.length; i++) {
    const banner = banners[i];
    const media = await getOrCreateMedia(banner.image, banner.image.split("/").pop() ?? "banner.svg");
    await prisma.banner.create({
      data: {
        titleTh: banner.titleTh,
        imageId: media.id,
        link: banner.link,
        order: i,
        active: banner.active,
      },
    });
  }
}

async function seedPopup() {
  const media = await getOrCreateMedia(
    popupConfig.image,
    popupConfig.image.split("/").pop() ?? "popup.svg"
  );
  await prisma.popupConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      enabled: popupConfig.enabled,
      titleTh: popupConfig.titleTh,
      imageId: media.id,
      link: popupConfig.link,
      frequency: popupConfig.frequency,
      startDate: new Date(popupConfig.startDate),
      endDate: new Date(popupConfig.endDate),
    },
  });
}

async function seedWidgets() {
  for (const widget of widgets) {
    await prisma.widget.upsert({
      where: { key: widget.key },
      update: {},
      create: {
        key: widget.key,
        name: widget.name,
        description: widget.description,
        enabled: widget.enabled,
      },
    });
  }
}

async function seedPosts() {
  for (const article of articles) {
    const media = await getOrCreateMedia(article.image, article.image.split("/").pop() ?? "article.svg");
    await prisma.post.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        slug: article.slug,
        kind: "ARTICLE",
        status: "PUBLISHED",
        titleTh: article.title,
        category: article.category,
        coverImageId: media.id,
        publishedAt: new Date(article.publishedAt),
      },
    });
  }

  for (const news of newsItems) {
    const media = await getOrCreateMedia(news.image, news.image.split("/").pop() ?? "news.svg");
    await prisma.post.upsert({
      where: { slug: news.slug },
      update: {},
      create: {
        slug: news.slug,
        kind: "NEWS",
        status: "PUBLISHED",
        titleTh: news.title,
        excerptTh: news.excerpt,
        featured: news.featured ?? false,
        coverImageId: media.id,
        publishedAt: new Date(news.publishedAt),
      },
    });
  }
}

async function seedProducts() {
  const statusMap = { active: "ACTIVE", draft: "DRAFT", archived: "ARCHIVED" } as const;
  for (const product of adminProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        nameTh: product.name,
        status: statusMap[product.status],
      },
    });
  }
}

async function seedPages() {
  // Only "home" is a real page-builder page today — the public site has no
  // other routes composed from Page/PageSection, so no other Page rows are
  // seeded here (avoid seeding placeholder pages with no real use yet).
  const created = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: { slug: "home", titleTh: "หน้าแรก", titleEn: "Home", status: "PUBLISHED" },
  });

  if ((await prisma.pageSection.count({ where: { pageId: created.id } })) > 0) return;

  for (const section of homeSections) {
    const type = SECTION_TYPE_MAP[section.type] ?? "CUSTOM";
    await prisma.pageSection.create({
      data: {
        pageId: created.id,
        order: section.order,
        type,
        titleTh: section.titleTh,
        titleEn: section.titleEn,
        visibleDesktop: section.visibility.desktop,
        visibleTablet: section.visibility.tablet,
        visibleMobile: section.visibility.mobile,
        columns: section.columns,
        itemsToShow: section.itemsToShow,
        config: { sourceLabel: section.sourceLabel },
      },
    });
  }
}

async function main() {
  await seedAdminUser();
  await seedNavLinks();
  await seedFooter();
  await seedBanners();
  await seedPopup();
  await seedWidgets();
  await seedPosts();
  await seedProducts();
  await seedPages();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
