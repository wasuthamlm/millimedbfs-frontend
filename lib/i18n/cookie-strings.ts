// Cookie-consent UI strings for all 9 site languages (ported verbatim from the
// legacy src/lib/cookieConsentI18n.js). Falls back to English, then Thai.
// Admin overrides per language live in SiteConfig "cookie_consent_config".

export type CookieStrings = {
  title: string;
  message: string;
  accept: string;
  reject: string;
  settings: string;
  save: string;
  necessary: string;
  necessaryDesc: string;
  analytics: string;
  analyticsDesc: string;
  marketing: string;
  marketingDesc: string;
  always: string;
  close: string;
  cookieSettings: string;
  savedNotice: string;
};

const COOKIE_I18N: Record<string, Partial<CookieStrings>> = {
  th: {
    title: 'เราใช้คุกกี้',
    message: 'เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพการใช้งานและวิเคราะห์การเข้าชม โดยคุณสามารถจัดการความยินยอมได้ตามต้องการ',
    accept: 'ยอมรับทั้งหมด',
    reject: 'ปฏิเสธ',
    settings: 'ตั้งค่า',
    save: 'บันทึกการตั้งค่า',
    necessary: 'คุกกี้ที่จำเป็น',
    necessaryDesc: 'จำเป็นต่อการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้',
    analytics: 'คุกกี้เพื่อการวิเคราะห์',
    analyticsDesc: 'ช่วยให้เราเข้าใจการใช้งานเว็บไซต์เพื่อปรับปรุงประสบการณ์',
    marketing: 'คุกกี้เพื่อการตลาด',
    marketingDesc: 'ใช้เพื่อแสดงเนื้อหาและโฆษณาที่เกี่ยวข้องกับคุณ',
    always: 'เปิดเสมอ',
  },
  en: {
    title: 'We use cookies',
    message: 'This website uses cookies to enhance your experience and analyze traffic. You can manage your consent below.',
    accept: 'Accept all',
    reject: 'Reject',
    settings: 'Settings',
    save: 'Save preferences',
    necessary: 'Necessary cookies',
    necessaryDesc: 'Required for the basic functioning of the site. Cannot be disabled.',
    analytics: 'Analytics cookies',
    analyticsDesc: 'Help us understand how the site is used so we can improve it.',
    marketing: 'Marketing cookies',
    marketingDesc: 'Used to show you relevant content and advertising.',
    always: 'Always on',
  },
  zh: {
    title: '我们使用 Cookie',
    message: '本网站使用 Cookie 以提升您的体验并分析访问情况。您可以在下方管理您的同意。',
    accept: '全部接受',
    reject: '拒绝',
    settings: '设置',
    save: '保存设置',
    necessary: '必要 Cookie',
    necessaryDesc: '网站基本运行所必需，无法停用。',
    analytics: '分析 Cookie',
    analyticsDesc: '帮助我们了解网站的使用情况以便改进。',
    marketing: '营销 Cookie',
    marketingDesc: '用于向您展示相关内容和广告。',
    always: '始终开启',
  },
  ko: {
    title: '쿠키 사용',
    message: '이 웹사이트는 사용자 경험을 향상하고 트래픽을 분석하기 위해 쿠키를 사용합니다. 아래에서 동의를 관리할 수 있습니다.',
    accept: '모두 수락',
    reject: '거부',
    settings: '설정',
    save: '설정 저장',
    necessary: '필수 쿠키',
    necessaryDesc: '사이트의 기본 작동에 필요하며 비활성화할 수 없습니다.',
    analytics: '분석 쿠키',
    analyticsDesc: '사이트 사용 방식을 파악하여 개선하는 데 도움이 됩니다.',
    marketing: '마케팅 쿠키',
    marketingDesc: '관련 콘텐츠와 광고를 표시하는 데 사용됩니다.',
    always: '항상 켜짐',
  },
  ja: {
    title: 'Cookie を使用しています',
    message: '当サイトでは、利便性の向上とアクセス解析のために Cookie を使用しています。以下で同意を管理できます。',
    accept: 'すべて同意',
    reject: '拒否',
    settings: '設定',
    save: '設定を保存',
    necessary: '必須 Cookie',
    necessaryDesc: 'サイトの基本機能に必要で、無効にできません。',
    analytics: '分析 Cookie',
    analyticsDesc: 'サイトの利用状況を把握し改善するために役立ちます。',
    marketing: 'マーケティング Cookie',
    marketingDesc: '関連するコンテンツや広告を表示するために使用します。',
    always: '常にオン',
  },
  my: {
    title: 'ကျွန်ုပ်တို့ Cookie သုံးပါသည်',
    message: 'ဤဝဘ်ဆိုက်သည် သင့်အတွေ့အကြုံ မြှင့်တင်ရန်နှင့် အသွားအလာ ခွဲခြမ်းစိတ်ဖြာရန် Cookie များကို သုံးပါသည်။ အောက်တွင် သဘောတူညီမှုကို စီမံနိုင်ပါသည်။',
    accept: 'အားလုံး လက်ခံမည်',
    reject: 'ငြင်းပယ်မည်',
    settings: 'ဆက်တင်များ',
    save: 'သိမ်းဆည်းမည်',
    necessary: 'မရှိမဖြစ် Cookie',
    necessaryDesc: 'ဝဘ်ဆိုက် အခြေခံလုပ်ဆောင်ရန် လိုအပ်ပြီး ပိတ်၍မရပါ။',
    analytics: 'ခွဲခြမ်းစိတ်ဖြာရေး Cookie',
    analyticsDesc: 'ဝဘ်ဆိုက်အသုံးပြုပုံကို နားလည်ပြီး တိုးတက်စေရန် ကူညီသည်။',
    marketing: 'စျေးကွက်ရှာဖွေရေး Cookie',
    marketingDesc: 'သင်နှင့်ဆက်စပ်သော အကြောင်းအရာနှင့် ကြော်ငြာပြရန် သုံးသည်။',
    always: 'အမြဲဖွင့်',
  },
  lo: {
    title: 'ພວກເຮົາໃຊ້ຄຸກກີ້',
    message: 'ເວັບໄຊນີ້ໃຊ້ຄຸກກີ້ເພື່ອປັບປຸງປະສົບການ ແລະ ວິເຄາະການເຂົ້າຊົມ. ທ່ານສາມາດຈັດການການຍິນຍອມໄດ້ຂ້າງລຸ່ມ.',
    accept: 'ຍອມຮັບທັງໝົດ',
    reject: 'ປະຕິເສດ',
    settings: 'ຕັ້ງຄ່າ',
    save: 'ບັນທຶກການຕັ້ງຄ່າ',
    necessary: 'ຄຸກກີ້ທີ່ຈຳເປັນ',
    necessaryDesc: 'ຈຳເປັນຕໍ່ການເຮັດວຽກພື້ນຖານ ແລະ ບໍ່ສາມາດປິດໄດ້.',
    analytics: 'ຄຸກກີ້ວິເຄາະ',
    analyticsDesc: 'ຊ່ວຍໃຫ້ພວກເຮົາເຂົ້າໃຈການໃຊ້ງານເພື່ອປັບປຸງ.',
    marketing: 'ຄຸກກີ້ການຕະຫຼາດ',
    marketingDesc: 'ໃຊ້ເພື່ອສະແດງເນື້ອຫາ ແລະ ໂຄສະນາທີ່ກ່ຽວຂ້ອງ.',
    always: 'ເປີດສະເໝີ',
  },
  vi: {
    title: 'Chúng tôi sử dụng cookie',
    message: 'Trang web này sử dụng cookie để nâng cao trải nghiệm và phân tích lưu lượng truy cập. Bạn có thể quản lý sự đồng ý bên dưới.',
    accept: 'Chấp nhận tất cả',
    reject: 'Từ chối',
    settings: 'Cài đặt',
    save: 'Lưu tùy chọn',
    necessary: 'Cookie cần thiết',
    necessaryDesc: 'Cần thiết cho hoạt động cơ bản của trang web. Không thể tắt.',
    analytics: 'Cookie phân tích',
    analyticsDesc: 'Giúp chúng tôi hiểu cách trang web được sử dụng để cải thiện.',
    marketing: 'Cookie tiếp thị',
    marketingDesc: 'Dùng để hiển thị nội dung và quảng cáo phù hợp với bạn.',
    always: 'Luôn bật',
  },
  ms: {
    title: 'Kami menggunakan kuki',
    message: 'Laman web ini menggunakan kuki untuk meningkatkan pengalaman anda dan menganalisis trafik. Anda boleh mengurus persetujuan di bawah.',
    accept: 'Terima semua',
    reject: 'Tolak',
    settings: 'Tetapan',
    save: 'Simpan tetapan',
    necessary: 'Kuki perlu',
    necessaryDesc: 'Diperlukan untuk fungsi asas laman. Tidak boleh dimatikan.',
    analytics: 'Kuki analitik',
    analyticsDesc: 'Membantu kami memahami penggunaan laman untuk penambahbaikan.',
    marketing: 'Kuki pemasaran',
    marketingDesc: 'Digunakan untuk menunjukkan kandungan dan iklan yang berkaitan.',
    always: 'Sentiasa hidup',
  },
}

// Strings added for the consent-settings dialog / footer entry point.
const EXTRA: Record<string, Partial<CookieStrings>> = {
  en: { close: 'Close', cookieSettings: 'Cookie settings', savedNotice: 'Your cookie preferences have been applied.' },
  th: { close: 'ปิด', cookieSettings: 'ตั้งค่าคุกกี้', savedNotice: 'บันทึกการตั้งค่าคุกกี้ของคุณแล้ว' },
  zh: { close: '关闭', cookieSettings: 'Cookie 设置', savedNotice: '您的 Cookie 设置已生效。' },
  ko: { close: '닫기', cookieSettings: '쿠키 설정', savedNotice: '쿠키 설정이 적용되었습니다.' },
  ja: { close: '閉じる', cookieSettings: 'Cookie 設定', savedNotice: 'Cookie の設定を適用しました。' },
  vi: { close: 'Đóng', cookieSettings: 'Cài đặt cookie', savedNotice: 'Tùy chọn cookie của bạn đã được áp dụng.' },
  ms: { close: 'Tutup', cookieSettings: 'Tetapan kuki', savedNotice: 'Tetapan kuki anda telah dikuatkuasakan.' },
}

export function getCookieStrings(lang: string): CookieStrings {
  const base = COOKIE_I18N[lang] || COOKIE_I18N.en;
  return { ...COOKIE_I18N.th, ...EXTRA.th, ...COOKIE_I18N.en, ...EXTRA.en, ...(EXTRA[lang] || {}), ...base } as CookieStrings;
}

export const COOKIE_TEXT_GROUPS: { label: string; fields: { key: keyof CookieStrings; label: string; multiline?: boolean }[] }[] = [
  {
    label: "แบนเนอร์",
    fields: [
      { key: "title", label: "หัวข้อ" },
      { key: "message", label: "ข้อความอธิบาย", multiline: true },
      { key: "accept", label: "ปุ่ม ยอมรับทั้งหมด" },
      { key: "reject", label: "ปุ่ม ปฏิเสธ" },
      { key: "settings", label: "ปุ่ม ตั้งค่า" },
      { key: "save", label: "ปุ่ม บันทึกการตั้งค่า" },
    ],
  },
  {
    label: "หมวดคุกกี้",
    fields: [
      { key: "necessary", label: "ชื่อ — คุกกี้ที่จำเป็น" },
      { key: "necessaryDesc", label: "คำอธิบาย — คุกกี้ที่จำเป็น", multiline: true },
      { key: "analytics", label: "ชื่อ — คุกกี้วิเคราะห์" },
      { key: "analyticsDesc", label: "คำอธิบาย — คุกกี้วิเคราะห์", multiline: true },
      { key: "marketing", label: "ชื่อ — คุกกี้การตลาด" },
      { key: "marketingDesc", label: "คำอธิบาย — คุกกี้การตลาด", multiline: true },
      { key: "always", label: "ป้าย เปิดเสมอ" },
    ],
  },
  {
    label: "อื่น ๆ",
    fields: [
      { key: "cookieSettings", label: "ลิงก์ใน Footer (ตั้งค่าคุกกี้)" },
      { key: "savedNotice", label: "ข้อความยืนยันหลังบันทึก" },
      { key: "close", label: "ปุ่มปิด (aria-label)" },
    ],
  },
];

export type PolicyLink = { labelTh: string; labelEn: string; url: string };
export type CookieConsentConfig = { texts: Record<string, Partial<CookieStrings>>; policyLinks: PolicyLink[] };

export const DEFAULT_COOKIE_CONFIG: CookieConsentConfig = {
  texts: {},
  policyLinks: [
    { labelTh: "นโยบายความเป็นส่วนตัว", labelEn: "Privacy Policy", url: "/privacy-policy" },
    { labelTh: "นโยบายการใช้คุกกี้", labelEn: "Cookie Policy", url: "/cookie-policy" },
  ],
};

/** Built-in copy for a locale with the admin's non-empty overrides on top. */
export function resolveCookieStrings(lang: string, config: CookieConsentConfig): CookieStrings {
  const overrides = Object.fromEntries(
    Object.entries(config.texts?.[lang] ?? {}).filter(([, v]) => typeof v === "string" && v.trim()),
  );
  return { ...getCookieStrings(lang), ...overrides };
}
