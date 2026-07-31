import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function wrapText(text, maxChars) {
  const words = [...text];
  const lines = [];
  let line = "";
  for (const ch of words) {
    line += ch;
    if (line.length >= maxChars) {
      lines.push(line);
      line = "";
    }
  }
  if (line) lines.push(line);
  return lines;
}

function svg({ width, height, from, to, title, small }) {
  const lines = wrapText(title, small ? 14 : 18);
  const fontSize = small ? 22 : 30;
  const lineHeight = fontSize * 1.35;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  const textEls = lines
    .map(
      (l, i) =>
        `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" font-family="'IBM Plex Sans Thai','Tahoma',sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${l}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${height * 0.35}" fill="#ffffff" opacity="0.06"/>
  <circle cx="${width * 0.1}" cy="${height * 0.9}" r="${height * 0.3}" fill="#ffffff" opacity="0.06"/>
  ${textEls}
</svg>`;
}

const newsItems = [
  { slug: "expo-2025", title: "งาน อย. Expo ที่อิมแพค ชาเลนเจอร์ 2 เมืองทองธานี", from: "#16296b", to: "#2f4bb0", featured: true },
  { slug: "otc-symposium-2022", title: "งาน OTC Symposium and Thank you Party", from: "#1d3a8a", to: "#3a5fd9" },
  { slug: "factory-open-day", title: "กิจกรรม Open Day เยี่ยมชมโรงงานผลิต", from: "#0d1a4a", to: "#1e3a8a" },
];

const articles = [
  { slug: "cold-water-sore-throat", title: "เจ็บคอกินน้ำเย็นได้ไหม? ควรดื่มต่อหรือเปลี่ยนเป็นน้ำอุ่นดีกว่า" },
  { slug: "birth-control-acne", title: "ยาคุมช่วยลดปัญหาสิวและรอบเดือนไม่สม่ำเสมอได้จริงไหม?" },
  { slug: "sore-throat-medicine", title: "เจ็บคอกินยาอะไร? รวมวิธีบรรเทาตามอาการ กลืนแล้วเจ็บควรดูแลแบบไหน" },
  { slug: "eye-serum-redness", title: "ไฮยาเซรั่มใช้แล้วผิวแดงระคายเคืองเกิดจากอะไร? ต้องหยุดใช้ไหม" },
  { slug: "ear-nose-rinse", title: "ล้างจมูกแล้วหูอื้อ อย่าเพิ่งตกใจ อาจเกิดจากสาเหตุนี้" },
  { slug: "hyaluron-serum-vs-cream", title: "ไฮยาเซรั่มกับครีมไฮยา ต่างกันยังไง? เลือกใช้อันไหนดี" },
  { slug: "hyaluron-concentration", title: "ไฮยาลูรอนเข้มข้นแค่ไหนถึงช่วยให้ผิวชุ่มชื้นดี?" },
  { slug: "dry-skin-serum", title: "ผิวแห้งสุดขีด ใช้ไฮยาเซรั่มอย่างเดียวพอไหม? ต้องเติมอะไรเพิ่ม" },
];

const outDir = fileURLToPath(new URL("../public/images/", import.meta.url));

newsItems.forEach((n) => {
  const file = svg({
    width: n.featured ? 1200 : 400,
    height: n.featured ? 800 : 300,
    from: n.from,
    to: n.to,
    title: n.title,
    small: !n.featured,
  });
  writeFileSync(join(outDir, "news", `${n.slug}.svg`), file);
});

const palette = [
  ["#0ea5e9", "#0369a1"],
  ["#ec4899", "#9d174d"],
  ["#16296b", "#3a5fd9"],
  ["#06b6d4", "#0e7490"],
  ["#8b5cf6", "#5b21b6"],
  ["#f472b6", "#be185d"],
  ["#0ea5e9", "#1e3a8a"],
  ["#22d3ee", "#155e75"],
];

articles.forEach((a, i) => {
  const [from, to] = palette[i % palette.length];
  const file = svg({ width: 480, height: 360, from, to, title: a.title, small: true });
  writeFileSync(join(outDir, "articles", `${a.slug}.svg`), file);
});

console.log("Generated placeholder images.");
