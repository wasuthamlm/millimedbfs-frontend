export type Widget = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export const widgets: Widget[] = [
  {
    id: "w1",
    name: "ปุ่มเลื่อนขึ้นด้านบน",
    description: "แสดงปุ่มลอยมุมขวาล่างเมื่อเลื่อนหน้าเว็บลง",
    enabled: true,
  },
  {
    id: "w2",
    name: "LINE Official Account",
    description: "ปุ่มลอยเชื่อมไปยัง LINE OA สำหรับติดต่อฝ่ายบริการลูกค้า",
    enabled: false,
  },
  {
    id: "w3",
    name: "Facebook Messenger",
    description: "แชทวิดเจ็ตเชื่อมกับ Facebook Page ของบริษัท",
    enabled: false,
  },
  {
    id: "w4",
    name: "แถบแจ้งเตือนคุกกี้ (Cookie Consent)",
    description: "แสดงแถบแจ้งเตือนการใช้คุกกี้ตาม PDPA",
    enabled: true,
  },
];
