export type FooterLink = {
  id: string;
  label: string;
  href: string;
};

export type FooterColumn = {
  id: string;
  title: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    id: "col1",
    title: "เมนูลัด",
    links: [
      { id: "l1", label: "เกี่ยวกับเรา", href: "/about" },
      { id: "l2", label: "อาคารโรงงาน", href: "/factory" },
      { id: "l3", label: "มาตรฐานผู้ผลิต", href: "/standards" },
      { id: "l4", label: "สินค้า", href: "/products" },
    ],
  },
  {
    id: "col2",
    title: "บัญชี",
    links: [
      { id: "l5", label: "สมัครสมาชิก", href: "/register" },
      { id: "l6", label: "เข้าสู่ระบบ", href: "/login" },
    ],
  },
];

export const footerContact = {
  phone: "02-XXX-XXXX",
  email: "info@millimedbfs.com",
  address: "กรุงเทพมหานคร ประเทศไทย",
  tagline: "Pass on Happiness",
};
