export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const navLinks: NavLink[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  {
    label: "อาคารโรงงาน",
    href: "/factory",
    children: [
      { label: "อาคารโรงงาน 1", href: "/factory/building-1" },
      { label: "อาคารโรงงาน 2", href: "/factory/building-2" },
    ],
  },
  { label: "มาตรฐานผู้ผลิต", href: "/standards" },
  {
    label: "สินค้า",
    href: "/products",
    children: [
      { label: "ผลิตภัณฑ์ดูแลดวงตา", href: "/products/eye-care" },
      { label: "ผลิตภัณฑ์ดูแลผิว", href: "/products/skin-care" },
    ],
  },
  { label: "ข่าวสาร", href: "/news" },
  { label: "บทความ", href: "/articles" },
  { label: "ติดต่อเรา", href: "/contact" },
];
