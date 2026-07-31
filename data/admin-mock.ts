export type AdminArticleStatus = "draft" | "published";

export type AdminArticle = {
  id: string;
  title: string;
  type: "article" | "news";
  status: AdminArticleStatus;
  updatedAt: string;
};

export type AdminProductStatus = "active" | "draft" | "archived";

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  status: AdminProductStatus;
  updatedAt: string;
};

export const adminStats = {
  totalProducts: 9,
  totalArticles: 55,
  publishedArticles: 48,
  pendingApproval: 15,
  unreadMessages: 0,
};

export const adminLatestArticles: AdminArticle[] = [
  {
    id: "a1",
    title: "วิธีล้างจมูกให้ปลอดภัยสำหรับผู้ป่วยไซนัสอักเสบ...",
    type: "article",
    status: "draft",
    updatedAt: "2026-07-14",
  },
  {
    id: "a2",
    title: "ล้างจมูกทุกวันดีไหม? หลายคนล้างทุกวัน แต่...",
    type: "article",
    status: "draft",
    updatedAt: "2026-07-14",
  },
  {
    id: "a3",
    title: "ล้างจมูกด้วยน้ำเกลือ ทำยังไง? มือใหม่ควรรู้...",
    type: "article",
    status: "draft",
    updatedAt: "2026-07-14",
  },
  {
    id: "a4",
    title: "ล้างจมูกได้บ่อยแค่ไหน? ทำทุกวันได้ไหม หรี...",
    type: "article",
    status: "draft",
    updatedAt: "2026-07-14",
  },
  {
    id: "a5",
    title: "ล้างจมูกแล้วน้ำไหลออกมาเยอะ ปกติไหม? เ...",
    type: "article",
    status: "draft",
    updatedAt: "2026-07-14",
  },
];

export const adminAllArticles: AdminArticle[] = [
  ...adminLatestArticles,
  {
    id: "a6",
    title: "เจ็บคอกินน้ำเย็นได้ไหม? ควรดื่มต่อหรือเปลี่ยนเป็นน้ำอุ่นดีกว่า",
    type: "article",
    status: "published",
    updatedAt: "2026-06-02",
  },
  {
    id: "a7",
    title: "ยาคุมช่วยลดปัญหาสิวและรอบเดือนไม่สม่ำเสมอได้จริงไหม?",
    type: "article",
    status: "published",
    updatedAt: "2026-05-20",
  },
  {
    id: "a8",
    title: "ไฮยาเซรั่มใช้แล้วผิวแดงระคายเคืองเกิดจากอะไร? ต้องหยุดใช้ไหม",
    type: "article",
    status: "published",
    updatedAt: "2026-04-28",
  },
  {
    id: "a9",
    title: "งาน อย. Expo ที่อิมแพค ชาเลนเจอร์ 2 เมืองทองธานี",
    type: "news",
    status: "published",
    updatedAt: "2026-07-25",
  },
  {
    id: "a10",
    title: "งาน OTC Symposium and Thank you Party",
    type: "news",
    status: "published",
    updatedAt: "2025-12-18",
  },
  {
    id: "a11",
    title: "ผิวแห้งสุดขีด ใช้ไฮยาเซรั่มอย่างเดียวพอไหม? ต้องเติมอะไรเพิ่ม",
    type: "article",
    status: "draft",
    updatedAt: "2026-03-10",
  },
  {
    id: "a12",
    title: "ล้างจมูกแล้วหูอื้อ อย่าเพิ่งตกใจ อาจเกิดจากสาเหตุนี้",
    type: "article",
    status: "published",
    updatedAt: "2025-04-15",
  },
];

export const adminProducts: AdminProduct[] = [
  { id: "p1", name: "ไฮยาเซรั่ม อาย ดรอปส์", sku: "MBFS-001", status: "active", updatedAt: "2026-07-10" },
  { id: "p2", name: "เทตราเคน อาย ดรอปส์", sku: "MBFS-002", status: "active", updatedAt: "2026-07-08" },
  { id: "p3", name: "ไฮยา ครีม", sku: "MBFS-003", status: "active", updatedAt: "2026-07-05" },
  { id: "p4", name: "น้ำเกลือล้างจมูก", sku: "MBFS-004", status: "active", updatedAt: "2026-06-30" },
  { id: "p5", name: "อาร์ทิฟิเชียล เทียร์ส", sku: "MBFS-005", status: "active", updatedAt: "2026-06-28" },
  { id: "p6", name: "อายแคร์ เจล", sku: "MBFS-006", status: "draft", updatedAt: "2026-06-20" },
  { id: "p7", name: "สกินแคร์ เซรั่ม", sku: "MBFS-007", status: "draft", updatedAt: "2026-06-18" },
  { id: "p8", name: "มอยส์เจอร์ไรเซอร์", sku: "MBFS-008", status: "active", updatedAt: "2026-06-15" },
  { id: "p9", name: "ซันสกรีน เอสพีเอฟ 50", sku: "MBFS-009", status: "archived", updatedAt: "2026-05-30" },
];
