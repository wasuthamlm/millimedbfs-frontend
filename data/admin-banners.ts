export type Banner = {
  id: string;
  titleTh: string;
  titleEn: string;
  altTextTh: string;
  altTextEn: string;
  captionTh: string;
  captionEn: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
};

export const banners: Banner[] = [
  {
    id: "b1",
    titleTh: "Millimed BFS ผู้นำด้านผลิตภัณฑ์ดูแลดวงตา",
    titleEn: "",
    altTextTh: "",
    altTextEn: "",
    captionTh: "",
    captionEn: "",
    image: "/images/news/expo-2025.svg",
    link: "/about",
    order: 1,
    active: true,
  },
  {
    id: "b2",
    titleTh: "มาตรฐานการผลิตระดับสากล",
    titleEn: "",
    altTextTh: "",
    altTextEn: "",
    captionTh: "",
    captionEn: "",
    image: "/images/news/factory-open-day.svg",
    link: "/standards",
    order: 2,
    active: true,
  },
  {
    id: "b3",
    titleTh: "โปรโมชั่นสมาชิกใหม่ รับส่วนลดพิเศษ",
    titleEn: "",
    altTextTh: "",
    altTextEn: "",
    captionTh: "",
    captionEn: "",
    image: "/images/news/otc-symposium-2022.svg",
    link: "/register",
    order: 3,
    active: false,
  },
];
