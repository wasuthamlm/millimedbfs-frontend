export type Article = {
  slug: string;
  title: string;
  image: string;
  publishedAt: string;
  category?: string;
};

export const articles: Article[] = [
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
