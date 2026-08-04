export type Widget = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  link?: string;
};

// `key` is a stable identifier the app uses to decide what each widget
// actually renders — must never be re-derived from the (Thai) name, since
// slugifying non-ASCII text does not produce a stable value.
export const widgets: Widget[] = [
  {
    id: "w1",
    key: "scroll-to-top",
    name: "ปุ่มเลื่อนขึ้นด้านบน",
    description: "แสดงปุ่มลอยมุมขวาล่างเมื่อเลื่อนหน้าเว็บลง",
    enabled: true,
  },
  {
    id: "w2",
    key: "line-official-account",
    name: "LINE Official Account",
    description: "ปุ่มลอยเชื่อมไปยัง LINE OA สำหรับติดต่อฝ่ายบริการลูกค้า",
    enabled: false,
  },
  {
    id: "w3",
    key: "facebook-messenger",
    name: "Facebook Messenger",
    description: "แชทวิดเจ็ตเชื่อมกับ Facebook Page ของบริษัท",
    enabled: false,
  },
  {
    id: "w4",
    key: "cookie-consent",
    name: "แถบแจ้งเตือนคุกกี้ (Cookie Consent)",
    description: "แสดงแถบแจ้งเตือนการใช้คุกกี้ตาม PDPA",
    enabled: true,
  },
];
