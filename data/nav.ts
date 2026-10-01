export type NavLink = {
  // Optional: present when built from DB rows (NavLink.id), absent for the static seed
  // below. Two admin-created menu items can legitimately point at the same href (e.g.
  // a redundant shortcut), so components must key on `id` when it's available rather
  // than `href` alone — see Navbar.tsx / MobileNav.tsx / NavDropdown.tsx.
  id?: string;
  label: string;
  href: string;
  newTab?: boolean;
  /** Up to two nested levels (menus are limited to 3 levels deep). */
  children?: NavLink[];
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
  { label: "บทความ", href: "/news/article" },
  { label: "ติดต่อเรา", href: "/contact" },
];
