export type PopupFrequency = "every-visit" | "once-per-day" | "once-per-session";

export type PopupConfig = {
  enabled: boolean;
  titleTh: string;
  image: string;
  link: string;
  frequency: PopupFrequency;
  startDate: string;
  endDate: string;
};

export const popupConfig: PopupConfig = {
  enabled: true,
  titleTh: "โปรโมชั่นสมัครสมาชิกใหม่",
  image: "/images/news/otc-symposium-2022.svg",
  link: "/register",
  frequency: "once-per-day",
  startDate: "2026-07-01",
  endDate: "2026-08-31",
};
