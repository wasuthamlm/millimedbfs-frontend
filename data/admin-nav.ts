import type { ComponentType } from "react";
import {
  GridIcon,
  BoxIcon,
  FileTextIcon,
  GlobeIcon,
  ListIconGlyph,
  ImageIcon,
  LanguagesIcon,
  Share2Icon,
  MailIcon,
  UsersIcon,
  SettingsIcon,
} from "@/components/ui/admin-icons";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

export const adminNavItems: AdminNavItem[] = [
  { label: "แดชบอร์ด", href: "/admin", icon: GridIcon },
  {
    label: "สินค้า",
    href: "/admin/products",
    icon: BoxIcon,
    children: [
      { label: "รายการสินค้า", href: "/admin/products" },
      { label: "จัดการหมวดหมู่", href: "/admin/products/categories" },
    ],
  },
  {
    label: "บทความ",
    href: "/admin/articles",
    icon: FileTextIcon,
    children: [
      { label: "รายการบทความ", href: "/admin/articles" },
      { label: "จัดการประเภท", href: "/admin/articles/categories" },
    ],
  },
  {
    label: "หน้าเว็บ",
    href: "/admin/pages",
    icon: GlobeIcon,
    children: [
      { label: "จัดการ Header", href: "/admin/site/header" },
      { label: "จัดการ Banners", href: "/admin/site/banners" },
      { label: "จัดการหน้าเว็บ", href: "/admin/pages" },
      { label: "จัดการ Popup", href: "/admin/site/popup" },
      { label: "จัดการ Footer", href: "/admin/site/footer" },
      { label: "จัดการ Widgets", href: "/admin/site/widgets" },
    ],
  },
  { label: "เมนูเว็บไซต์", href: "/admin/menus", icon: ListIconGlyph },
  { label: "คลังสื่อ", href: "/admin/media", icon: ImageIcon },
  { label: "แปลภาษา", href: "/admin/translations", icon: LanguagesIcon },
  { label: "การแนะนำ", href: "/admin/recommendations", icon: Share2Icon },
  { label: "ข้อความติดต่อ", href: "/admin/messages", icon: MailIcon },
  { label: "จัดการผู้ใช้งาน", href: "/admin/users", icon: UsersIcon },
  { label: "การตั้งค่า", href: "/admin/settings", icon: SettingsIcon },
];
