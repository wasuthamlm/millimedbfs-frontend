export type NewsItem = {
  slug: string;
  title: string;
  excerpt?: string;
  image: string;
  publishedAt: string;
  featured?: boolean;
};

export const newsItems: NewsItem[] = [
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
