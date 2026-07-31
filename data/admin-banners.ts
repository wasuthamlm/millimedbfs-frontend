export type Banner = {
  id: string;
  titleTh: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
};

export const banners: Banner[] = [
  {
    id: "b1",
    titleTh: "Millimed BFS ผู้นำด้านผลิตภัณฑ์ดูแลดวงตา",
    image: "/images/news/expo-2025.svg",
    link: "/about",
    order: 1,
    active: true,
  },
  {
    id: "b2",
    titleTh: "มาตรฐานการผลิตระดับสากล",
    image: "/images/news/factory-open-day.svg",
    link: "/standards",
    order: 2,
    active: true,
  },
  {
    id: "b3",
    titleTh: "โปรโมชั่นสมาชิกใหม่ รับส่วนลดพิเศษ",
    image: "/images/news/otc-symposium-2022.svg",
    link: "/register",
    order: 3,
    active: false,
  },
];
