// Fixed UI text of the public site in every supported language. Content
// (titles, bodies, menus, …) comes from the database; these are only the
// labels the code itself renders. Missing entries fall back to Thai.

type Entry = { th: string; en: string; zh?: string; ko?: string; ja?: string; my?: string; lo?: string; vi?: string; ms?: string };

const UI = {
  home: { th: "หน้าแรก", en: "Home", zh: "首页", ko: "홈", ja: "ホーム", my: "ပင်မစာမျက်နှာ", lo: "ໜ້າຫຼັກ", vi: "Trang chủ", ms: "Laman Utama" },
  products: { th: "ผลิตภัณฑ์", en: "Products", zh: "产品", ko: "제품", ja: "製品", my: "ထုတ်ကုန်များ", lo: "ຜະລິດຕະພັນ", vi: "Sản phẩm", ms: "Produk" },
  productsDesc: { th: "ผลิตภัณฑ์ของ Millimed BFS", en: "Millimed BFS products", zh: "Millimed BFS 产品", ko: "Millimed BFS 제품", ja: "Millimed BFS の製品", my: "Millimed BFS ထုတ်ကုန်များ", lo: "ຜະລິດຕະພັນຂອງ Millimed BFS", vi: "Sản phẩm của Millimed BFS", ms: "Produk Millimed BFS" },
  newsAndArticles: { th: "ข่าวสารและบทความ", en: "News & Articles", zh: "新闻与文章", ko: "뉴스 및 기사", ja: "ニュース・記事", my: "သတင်းနှင့် ဆောင်းပါးများ", lo: "ຂ່າວສານ ແລະ ບົດຄວາມ", vi: "Tin tức & Bài viết", ms: "Berita & Artikel" },
  newsDesc: { th: "ข่าวสาร กิจกรรม และบทความน่ารู้ด้านสุขภาพจาก Millimed BFS", en: "News, events and health articles from Millimed BFS", zh: "Millimed BFS 的新闻、活动和健康文章", ko: "Millimed BFS의 뉴스, 이벤트 및 건강 기사", ja: "Millimed BFS のニュース、イベント、健康記事", my: "Millimed BFS မှ သတင်း၊ ပွဲများနှင့် ကျန်းမာရေး ဆောင်းပါးများ", lo: "ຂ່າວສານ, ກິດຈະກຳ ແລະ ບົດຄວາມສຸຂະພາບຈາກ Millimed BFS", vi: "Tin tức, sự kiện và bài viết sức khỏe từ Millimed BFS", ms: "Berita, acara dan artikel kesihatan daripada Millimed BFS" },
  latestNews: { th: "ข่าวสารล่าสุด", en: "Latest news", zh: "最新消息", ko: "최신 뉴스", ja: "最新ニュース", my: "နောက်ဆုံးသတင်း", lo: "ຂ່າວລ່າສຸດ", vi: "Tin mới nhất", ms: "Berita terkini" },
  articles: { th: "บทความน่ารู้", en: "Articles", zh: "健康知识", ko: "유익한 기사", ja: "お役立ち記事", my: "ဗဟုသုတ ဆောင်းပါးများ", lo: "ບົດຄວາມໜ້າຮູ້", vi: "Bài viết hữu ích", ms: "Artikel berguna" },
  all: { th: "ทั้งหมด", en: "All", zh: "全部", ko: "전체", ja: "すべて", my: "အားလုံး", lo: "ທັງໝົດ", vi: "Tất cả", ms: "Semua" },
  articleTypes: { th: "ประเภทบทความ", en: "Article types", zh: "文章类别", ko: "기사 유형", ja: "記事の種類", my: "ဆောင်းပါး အမျိုးအစား", lo: "ປະເພດບົດຄວາມ", vi: "Loại bài viết", ms: "Jenis artikel" },
  noArticles: { th: "ยังไม่มีบทความ", en: "No articles yet", zh: "暂无文章", ko: "아직 기사가 없습니다", ja: "記事はまだありません", my: "ဆောင်းပါး မရှိသေးပါ", lo: "ຍັງບໍ່ມີບົດຄວາມ", vi: "Chưa có bài viết", ms: "Belum ada artikel" },
  noProducts: { th: "ยังไม่มีสินค้าในหมวดนี้", en: "No products in this category yet", zh: "此类别暂无产品", ko: "이 카테고리에 아직 제품이 없습니다", ja: "このカテゴリーにはまだ製品がありません", my: "ဤအမျိုးအစားတွင် ထုတ်ကုန် မရှိသေးပါ", lo: "ຍັງບໍ່ມີສິນຄ້າໃນໝວດນີ້", vi: "Chưa có sản phẩm trong danh mục này", ms: "Belum ada produk dalam kategori ini" },
  noImage: { th: "ไม่มีรูปภาพ", en: "No image", zh: "暂无图片", ko: "이미지 없음", ja: "画像なし", my: "ပုံမရှိပါ", lo: "ບໍ່ມີຮູບ", vi: "Không có hình ảnh", ms: "Tiada imej" },
  bestSeller: { th: "ขายดี", en: "Best seller", zh: "热销", ko: "베스트셀러", ja: "人気商品", my: "အရောင်းရဆုံး", lo: "ຂາຍດີ", vi: "Bán chạy", ms: "Terlaris" },
  relatedProducts: { th: "สินค้าที่เกี่ยวข้อง", en: "Related products", zh: "相关产品", ko: "관련 제품", ja: "関連製品", my: "ဆက်စပ် ထုတ်ကုန်များ", lo: "ສິນຄ້າທີ່ກ່ຽວຂ້ອງ", vi: "Sản phẩm liên quan", ms: "Produk berkaitan" },
  relatedArticles: { th: "บทความที่เกี่ยวข้อง", en: "Related articles", zh: "相关文章", ko: "관련 기사", ja: "関連記事", my: "ဆက်စပ် ဆောင်းပါးများ", lo: "ບົດຄວາມທີ່ກ່ຽວຂ້ອງ", vi: "Bài viết liên quan", ms: "Artikel berkaitan" },
  faq: { th: "คำถามที่พบบ่อย", en: "Frequently asked questions", zh: "常见问题", ko: "자주 묻는 질문", ja: "よくある質問", my: "မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ", lo: "ຄຳຖາມທີ່ພົບເລື້ອຍ", vi: "Câu hỏi thường gặp", ms: "Soalan lazim" },
  download: { th: "ดาวน์โหลด", en: "Download", zh: "下载", ko: "다운로드", ja: "ダウンロード", my: "ဒေါင်းလုဒ်", lo: "ດາວໂຫຼດ", vi: "Tải xuống", ms: "Muat turun" },
  video: { th: "วิดีโอ", en: "Video", zh: "视频", ko: "동영상", ja: "動画", my: "ဗီဒီယို", lo: "ວິດີໂອ", vi: "Video", ms: "Video" },
  map: { th: "แผนที่", en: "Map", zh: "地图", ko: "지도", ja: "地図", my: "မြေပုံ", lo: "ແຜນທີ່", vi: "Bản đồ", ms: "Peta" },
  address: { th: "ที่อยู่", en: "Address", zh: "地址", ko: "주소", ja: "住所", my: "လိပ်စာ", lo: "ທີ່ຢູ່", vi: "Địa chỉ", ms: "Alamat" },
  phone: { th: "โทรศัพท์", en: "Phone", zh: "电话", ko: "전화", ja: "電話", my: "ဖုန်း", lo: "ໂທລະສັບ", vi: "Điện thoại", ms: "Telefon" },
  email: { th: "อีเมล", en: "Email", zh: "电子邮件", ko: "이메일", ja: "メール", my: "အီးမေးလ်", lo: "ອີເມວ", vi: "Email", ms: "E-mel" },
  taxId: { th: "เลขประจำตัวผู้เสียภาษี", en: "Tax ID", zh: "税号", ko: "사업자 등록번호", ja: "納税者番号", my: "အခွန်မှတ်ပုံတင်အမှတ်", lo: "ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ", vi: "Mã số thuế", ms: "No. cukai" },
  contactUs: { th: "ติดต่อเรา", en: "Contact us", zh: "联系我们", ko: "문의하기", ja: "お問い合わせ", my: "ဆက်သွယ်ရန်", lo: "ຕິດຕໍ່ພວກເຮົາ", vi: "Liên hệ", ms: "Hubungi kami" },
  contactDesc: { th: "ช่องทางการติดต่อ Millimed BFS", en: "How to contact Millimed BFS", zh: "Millimed BFS 联系方式", ko: "Millimed BFS 연락처", ja: "Millimed BFS へのお問い合わせ", my: "Millimed BFS ဆက်သွယ်ရန် နည်းလမ်းများ", lo: "ຊ່ອງທາງຕິດຕໍ່ Millimed BFS", vi: "Thông tin liên hệ Millimed BFS", ms: "Cara menghubungi Millimed BFS" },
  call: { th: "โทร", en: "Call", zh: "致电", ko: "전화", ja: "電話", my: "ခေါ်ဆိုရန်", lo: "ໂທ", vi: "Gọi", ms: "Hubungi" },
  privacyPolicy: { th: "นโยบายความเป็นส่วนตัว", en: "Privacy policy", zh: "隐私政策", ko: "개인정보 처리방침", ja: "プライバシーポリシー", my: "ကိုယ်ရေးအချက်အလက် မူဝါဒ", lo: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ", vi: "Chính sách bảo mật", ms: "Dasar privasi" },
  cookiePolicy: { th: "นโยบายการใช้คุกกี้", en: "Cookie policy", zh: "Cookie 政策", ko: "쿠키 정책", ja: "クッキーポリシー", my: "ကွတ်ကီး မူဝါဒ", lo: "ນະໂຍບາຍຄຸກກີ", vi: "Chính sách cookie", ms: "Dasar kuki" },
  menu: { th: "เมนู", en: "Menu", zh: "菜单", ko: "메뉴", ja: "メニュー", my: "မီနူး", lo: "ເມນູ", vi: "Menu", ms: "Menu" },
  mainMenu: { th: "เมนูหลัก", en: "Main menu", zh: "主菜单", ko: "메인 메뉴", ja: "メインメニュー", my: "ပင်မမီနူး", lo: "ເມນູຫຼັກ", vi: "Menu chính", ms: "Menu utama" },
  openMenu: { th: "เปิดเมนู", en: "Open menu", zh: "打开菜单", ko: "메뉴 열기", ja: "メニューを開く", my: "မီနူးဖွင့်ရန်", lo: "ເປີດເມນູ", vi: "Mở menu", ms: "Buka menu" },
  closeMenu: { th: "ปิดเมนู", en: "Close menu", zh: "关闭菜单", ko: "메뉴 닫기", ja: "メニューを閉じる", my: "မီနူးပိတ်ရန်", lo: "ປິດເມນູ", vi: "Đóng menu", ms: "Tutup menu" },
  close: { th: "ปิด", en: "Close", zh: "关闭", ko: "닫기", ja: "閉じる", my: "ပိတ်ရန်", lo: "ປິດ", vi: "Đóng", ms: "Tutup" },
  search: { th: "ค้นหา", en: "Search", zh: "搜索", ko: "검색", ja: "検索", my: "ရှာဖွေရန်", lo: "ຄົ້ນຫາ", vi: "Tìm kiếm", ms: "Cari" },
  chooseLanguage: { th: "เลือกภาษา / Language", en: "Language", zh: "语言 / Language", ko: "언어 / Language", ja: "言語 / Language", my: "ဘာသာစကား / Language", lo: "ພາສາ / Language", vi: "Ngôn ngữ / Language", ms: "Bahasa / Language" },
  backToTop: { th: "เลื่อนขึ้นด้านบน", en: "Back to top", zh: "返回顶部", ko: "맨 위로", ja: "ページの先頭へ", my: "အပေါ်သို့", lo: "ກັບຂຶ້ນເທິງ", vi: "Lên đầu trang", ms: "Kembali ke atas" },
  prevSlide: { th: "สไลด์ก่อนหน้า", en: "Previous slide", zh: "上一张", ko: "이전 슬라이드", ja: "前のスライド", my: "ယခင်ပုံ", lo: "ສະໄລກ່ອນໜ້າ", vi: "Trang trước", ms: "Slaid sebelumnya" },
  nextSlide: { th: "สไลด์ถัดไป", en: "Next slide", zh: "下一张", ko: "다음 슬라이드", ja: "次のスライド", my: "နောက်ပုံ", lo: "ສະໄລຖັດໄປ", vi: "Trang sau", ms: "Slaid seterusnya" },
  prevImage: { th: "รูปก่อนหน้า", en: "Previous image", zh: "上一张图片", ko: "이전 이미지", ja: "前の画像", my: "ယခင်ပုံ", lo: "ຮູບກ່ອນໜ້າ", vi: "Ảnh trước", ms: "Imej sebelumnya" },
  nextImage: { th: "รูปถัดไป", en: "Next image", zh: "下一张图片", ko: "다음 이미지", ja: "次の画像", my: "နောက်ပုံ", lo: "ຮູບຖັດໄປ", vi: "Ảnh sau", ms: "Imej seterusnya" },
  enlargeImage: { th: "ขยายรูป", en: "Enlarge image", zh: "放大图片", ko: "이미지 확대", ja: "画像を拡大", my: "ပုံချဲ့ရန်", lo: "ຂະຫຍາຍຮູບ", vi: "Phóng to ảnh", ms: "Besarkan imej" },
  comingSoon: { th: "หน้านี้กำลังจะมาเร็ว ๆ นี้", en: "This page is coming soon", zh: "此页面即将推出", ko: "곧 공개될 페이지입니다", ja: "このページは近日公開予定です", my: "ဤစာမျက်နှာ မကြာမီ ရောက်ရှိလာမည်", lo: "ໜ້ານີ້ກຳລັງຈະມາໃນໄວໆນີ້", vi: "Trang này sắp ra mắt", ms: "Halaman ini akan datang tidak lama lagi" },
  notFoundTitle: { th: "ไม่พบหน้าที่คุณต้องการ", en: "Page not found", zh: "找不到页面", ko: "페이지를 찾을 수 없습니다", ja: "ページが見つかりません", my: "စာမျက်နှာ ရှာမတွေ့ပါ", lo: "ບໍ່ພົບໜ້າທີ່ທ່ານຕ້ອງການ", vi: "Không tìm thấy trang", ms: "Halaman tidak ditemui" },
  notFoundBody: { th: "หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง", en: "This page may have moved or no longer exists", zh: "此页面可能已移动或不存在", ko: "페이지가 이동되었거나 존재하지 않습니다", ja: "ページが移動したか、存在しない可能性があります", my: "ဤစာမျက်နှာ ရွှေ့ထားခြင်း သို့မဟုတ် မရှိတော့ခြင်း ဖြစ်နိုင်သည်", lo: "ໜ້ານີ້ອາດຖືກຍ້າຍ ຫຼື ບໍ່ມີຢູ່", vi: "Trang này có thể đã bị chuyển hoặc không tồn tại", ms: "Halaman ini mungkin telah dialihkan atau tidak wujud" },
  backHome: { th: "กลับหน้าแรก", en: "Back to home", zh: "返回首页", ko: "홈으로", ja: "ホームへ戻る", my: "ပင်မစာမျက်နှာသို့", lo: "ກັບໜ້າຫຼັກ", vi: "Về trang chủ", ms: "Kembali ke laman utama" },
  errorTitle: { th: "เกิดข้อผิดพลาดบางอย่าง", en: "Something went wrong", zh: "出现了一些问题", ko: "문제가 발생했습니다", ja: "問題が発生しました", my: "တစ်ခုခု မှားယွင်းသွားသည်", lo: "ເກີດຂໍ້ຜິດພາດບາງຢ່າງ", vi: "Đã xảy ra lỗi", ms: "Sesuatu telah berlaku" },
  errorBody: { th: "ขออภัยในความไม่สะดวก กรุณาลองใหม่อีกครั้ง", en: "Sorry for the inconvenience. Please try again.", zh: "给您带来不便，敬请谅解。请重试。", ko: "불편을 드려 죄송합니다. 다시 시도해 주세요.", ja: "ご不便をおかけして申し訳ありません。もう一度お試しください。", my: "အဆင်မပြေမှုအတွက် တောင်းပန်ပါသည်။ ထပ်မံကြိုးစားပါ။", lo: "ຂໍອະໄພໃນຄວາມບໍ່ສະດວກ ກະລຸນາລອງໃໝ່", vi: "Xin lỗi vì sự bất tiện. Vui lòng thử lại.", ms: "Maaf atas kesulitan. Sila cuba lagi." },
  tryAgain: { th: "ลองใหม่", en: "Try again", zh: "重试", ko: "다시 시도", ja: "再試行", my: "ထပ်ကြိုးစားရန်", lo: "ລອງໃໝ່", vi: "Thử lại", ms: "Cuba lagi" },
  // Contact form
  formName: { th: "ชื่อ-นามสกุล", en: "Full name", zh: "姓名", ko: "이름", ja: "氏名", my: "အမည်အပြည့်အစုံ", lo: "ຊື່ ແລະ ນາມສະກຸນ", vi: "Họ và tên", ms: "Nama penuh" },
  formEmail: { th: "อีเมล", en: "Email", zh: "电子邮件", ko: "이메일", ja: "メールアドレス", my: "အီးမေးလ်", lo: "ອີເມວ", vi: "Email", ms: "E-mel" },
  formPhone: { th: "เบอร์โทรศัพท์", en: "Phone number", zh: "电话号码", ko: "전화번호", ja: "電話番号", my: "ဖုန်းနံပါတ်", lo: "ເບີໂທລະສັບ", vi: "Số điện thoại", ms: "Nombor telefon" },
  formSubject: { th: "หัวข้อ", en: "Subject", zh: "主题", ko: "제목", ja: "件名", my: "ခေါင်းစဉ်", lo: "ຫົວຂໍ້", vi: "Chủ đề", ms: "Subjek" },
  formMessage: { th: "ข้อความ", en: "Message", zh: "留言", ko: "메시지", ja: "メッセージ", my: "စာ", lo: "ຂໍ້ຄວາມ", vi: "Nội dung", ms: "Mesej" },
  formSelect: { th: "— เลือก —", en: "— Select —", zh: "— 请选择 —", ko: "— 선택 —", ja: "— 選択 —", my: "— ရွေးရန် —", lo: "— ເລືອກ —", vi: "— Chọn —", ms: "— Pilih —" },
  formSend: { th: "ส่งข้อความ", en: "Send message", zh: "发送", ko: "보내기", ja: "送信", my: "ပို့ရန်", lo: "ສົ່ງຂໍ້ຄວາມ", vi: "Gửi tin nhắn", ms: "Hantar mesej" },
  formSending: { th: "กำลังส่ง...", en: "Sending...", zh: "发送中...", ko: "보내는 중...", ja: "送信中...", my: "ပို့နေသည်...", lo: "ກຳລັງສົ່ງ...", vi: "Đang gửi...", ms: "Menghantar..." },
  formSent: { th: "ส่งข้อความเรียบร้อยแล้ว", en: "Message sent", zh: "发送成功", ko: "메시지가 전송되었습니다", ja: "送信しました", my: "စာပို့ပြီးပါပြီ", lo: "ສົ່ງຂໍ້ຄວາມແລ້ວ", vi: "Đã gửi tin nhắn", ms: "Mesej dihantar" },
  formSentBody: { th: "ทีมงานจะติดต่อกลับโดยเร็วที่สุด", en: "Our team will get back to you shortly", zh: "我们会尽快与您联系", ko: "빠른 시일 내에 연락드리겠습니다", ja: "担当者より折り返しご連絡いたします", my: "ကျွန်ုပ်တို့အဖွဲ့မှ အမြန်ဆုံး ပြန်လည်ဆက်သွယ်ပါမည်", lo: "ທີມງານຈະຕິດຕໍ່ກັບໄວທີ່ສຸດ", vi: "Chúng tôi sẽ liên hệ lại sớm nhất", ms: "Pasukan kami akan menghubungi anda segera" },
  formSendAgain: { th: "ส่งข้อความอีกครั้ง", en: "Send another message", zh: "再次发送", ko: "다시 보내기", ja: "もう一度送信", my: "နောက်ထပ်ပို့ရန်", lo: "ສົ່ງອີກຄັ້ງ", vi: "Gửi tin nhắn khác", ms: "Hantar mesej lain" },
  formError: { th: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", en: "Could not send your message. Please try again.", zh: "发送失败，请重试。", ko: "전송하지 못했습니다. 다시 시도해 주세요.", ja: "送信できませんでした。もう一度お試しください。", my: "မပို့နိုင်ပါ။ ထပ်မံကြိုးစားပါ။", lo: "ສົ່ງບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", vi: "Gửi không thành công. Vui lòng thử lại.", ms: "Mesej tidak dapat dihantar. Sila cuba lagi." },
  sku: { th: "รหัสสินค้า", en: "SKU", zh: "产品编号", ko: "제품 코드", ja: "品番", my: "ကုန်ပစ္စည်းကုဒ်", lo: "ລະຫັດສິນຄ້າ", vi: "Mã sản phẩm", ms: "Kod produk" },
  chatLine: { th: "แชทผ่าน LINE Official Account", en: "Chat on LINE Official Account", zh: "通过 LINE 官方账号聊天", ko: "LINE 공식 계정으로 채팅", ja: "LINE公式アカウントでチャット", my: "LINE Official Account ဖြင့် စကားပြောရန်", lo: "ແຊັດຜ່ານ LINE Official Account", vi: "Trò chuyện qua LINE Official Account", ms: "Sembang melalui LINE Official Account" },
  chatMessenger: { th: "แชทผ่าน Facebook Messenger", en: "Chat on Facebook Messenger", zh: "通过 Facebook Messenger 聊天", ko: "Facebook Messenger로 채팅", ja: "Facebook Messengerでチャット", my: "Facebook Messenger ဖြင့် စကားပြောရန်", lo: "ແຊັດຜ່ານ Facebook Messenger", vi: "Trò chuyện qua Facebook Messenger", ms: "Sembang melalui Facebook Messenger" },
  readAll: { th: "อ่านทั้งหมด", en: "View all", zh: "查看全部", ko: "전체 보기", ja: "すべて見る", my: "အားလုံးကြည့်ရန်", lo: "ອ່ານທັງໝົດ", vi: "Xem tất cả", ms: "Lihat semua" },
  readMore: { th: "อ่านต่อ", en: "Read more", zh: "阅读更多", ko: "더 보기", ja: "続きを読む", my: "ဆက်ဖတ်ရန်", lo: "ອ່ານຕໍ່", vi: "Đọc thêm", ms: "Baca lagi" },
  footerTagline: { th: "ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย", en: "A leading Thai manufacturer and distributor of medical and eye-care products", zh: "泰国领先的医疗及眼部护理产品制造商和经销商", ko: "태국의 선도적인 의약품 및 안과 관리 제품 제조·유통 기업", ja: "タイを代表する医療・アイケア製品のメーカー兼販売会社", my: "ထိုင်းနိုင်ငံ၏ ထိပ်တန်း ဆေးဝါးနှင့် မျက်စိစောင့်ရှောက်မှု ထုတ်ကုန် ထုတ်လုပ်သူနှင့် ဖြန့်ချိသူ", lo: "ຜູ້ຜະລິດ ແລະ ຈຳໜ່າຍຜະລິດຕະພັນການແພດ ແລະ ການດູແລດວງຕາຊັ້ນນຳຂອງໄທ", vi: "Nhà sản xuất và phân phối hàng đầu Thái Lan về sản phẩm y tế và chăm sóc mắt", ms: "Pengeluar dan pengedar terkemuka Thailand bagi produk perubatan dan penjagaan mata" },
  searchProducts: { th: "ค้นหาสินค้า...", en: "Search products...", zh: "搜索产品...", ko: "제품 검색...", ja: "製品を検索...", my: "ထုတ်ကုန် ရှာရန်...", lo: "ຄົ້ນຫາສິນຄ້າ...", vi: "Tìm sản phẩm...", ms: "Cari produk..." },
  filterByPrice: { th: "กรองตามราคา", en: "Filter by price", zh: "按价格筛选", ko: "가격별 필터", ja: "価格で絞り込む", my: "ဈေးနှုန်းဖြင့် စစ်ထုတ်ရန်", lo: "ກັ່ນຕອງຕາມລາຄາ", vi: "Lọc theo giá", ms: "Tapis mengikut harga" },
  sortBy: { th: "เรียงลำดับ", en: "Sort by", zh: "排序", ko: "정렬", ja: "並び替え", my: "စီရန်", lo: "ລຽງລຳດັບ", vi: "Sắp xếp", ms: "Susun ikut" },
  priceAll: { th: "ทุกราคา", en: "All prices", zh: "所有价格", ko: "전체 가격", ja: "すべての価格", my: "ဈေးနှုန်းအားလုံး", lo: "ທຸກລາຄາ", vi: "Tất cả mức giá", ms: "Semua harga" },
  priceUnder500: { th: "ต่ำกว่า ฿500", en: "Under ฿500", zh: "฿500 以下", ko: "฿500 미만", ja: "฿500 未満", my: "฿500 အောက်", lo: "ຕ່ຳກວ່າ ฿500", vi: "Dưới ฿500", ms: "Bawah ฿500" },
  price500to1000: { th: "฿500 – ฿1,000", en: "฿500 – ฿1,000" },
  price1000to2000: { th: "฿1,000 – ฿2,000", en: "฿1,000 – ฿2,000" },
  priceOver2000: { th: "มากกว่า ฿2,000", en: "Over ฿2,000", zh: "฿2,000 以上", ko: "฿2,000 초과", ja: "฿2,000 超", my: "฿2,000 အထက်", lo: "ຫຼາຍກວ່າ ฿2,000", vi: "Trên ฿2,000", ms: "Melebihi ฿2,000" },
  sortRecommended: { th: "เรียงตามแนะนำ", en: "Recommended", zh: "推荐", ko: "추천순", ja: "おすすめ順", my: "အကြံပြုထားသည်", lo: "ແນະນຳ", vi: "Đề xuất", ms: "Disyorkan" },
  sortNameAsc: { th: "ชื่อ ก → ฮ", en: "Name A → Z", zh: "名称 A → Z", ko: "이름 가 → 하", ja: "名前 昇順", my: "အမည် A → Z", lo: "ຊື່ ກ → ຮ", vi: "Tên A → Z", ms: "Nama A → Z" },
  sortNameDesc: { th: "ชื่อ ฮ → ก", en: "Name Z → A", zh: "名称 Z → A", ko: "이름 하 → 가", ja: "名前 降順", my: "အမည် Z → A", lo: "ຊື່ ຮ → ກ", vi: "Tên Z → A", ms: "Nama Z → A" },
  sortPriceAsc: { th: "ราคา ต่ำ → สูง", en: "Price low → high", zh: "价格 低 → 高", ko: "가격 낮은순", ja: "価格の安い順", my: "ဈေး နိမ့် → မြင့်", lo: "ລາຄາ ຕ່ຳ → ສູງ", vi: "Giá thấp → cao", ms: "Harga rendah → tinggi" },
  sortPriceDesc: { th: "ราคา สูง → ต่ำ", en: "Price high → low", zh: "价格 高 → 低", ko: "가격 높은순", ja: "価格の高い順", my: "ဈေး မြင့် → နိမ့်", lo: "ລາຄາ ສູງ → ຕ່ຳ", vi: "Giá cao → thấp", ms: "Harga tinggi → rendah" },
  itemsCount: { th: "{n} รายการ", en: "{n} items", zh: "{n} 件", ko: "{n}개", ja: "{n} 件", my: "{n} ခု", lo: "{n} ລາຍການ", vi: "{n} mục", ms: "{n} item" },
  noProductsFound: { th: "ไม่พบสินค้าที่ค้นหา", en: "No products found", zh: "未找到产品", ko: "검색된 제품이 없습니다", ja: "該当する製品がありません", my: "ထုတ်ကုန် မတွေ့ပါ", lo: "ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ", vi: "Không tìm thấy sản phẩm", ms: "Tiada produk ditemui" },
  clearSearch: { th: "ล้างการค้นหา", en: "Clear search", zh: "清除搜索", ko: "검색 초기화", ja: "検索をクリア", my: "ရှာဖွေမှု ရှင်းရန်", lo: "ລ້າງການຄົ້ນຫາ", vi: "Xóa tìm kiếm", ms: "Kosongkan carian" },
  allCategories: { th: "ทุกหมวดหมู่", en: "All categories", zh: "所有类别", ko: "전체 카테고리", ja: "すべてのカテゴリー", my: "အမျိုးအစားအားလုံး", lo: "ທຸກໝວດໝູ່", vi: "Tất cả danh mục", ms: "Semua kategori" },
  baht: { th: "บาท", en: "THB", zh: "泰铢", ko: "바트", ja: "バーツ", my: "ဘတ်", lo: "ບາດ", vi: "baht", ms: "baht" },
  searchResults: { th: "ผลการค้นหา", en: "Search results", zh: "搜索结果", ko: "검색 결과", ja: "検索結果", my: "ရှာဖွေမှု ရလဒ်များ", lo: "ຜົນການຄົ້ນຫາ", vi: "Kết quả tìm kiếm", ms: "Hasil carian" },
  searchResultsFor: { th: "ผลการค้นหา “{q}”", en: "Results for “{q}”", zh: "“{q}” 的搜索结果", ko: "“{q}” 검색 결과", ja: "「{q}」の検索結果", my: "“{q}” အတွက် ရလဒ်များ", lo: "ຜົນການຄົ້ນຫາ “{q}”", vi: "Kết quả cho “{q}”", ms: "Hasil carian “{q}”" },
  searchHint: { th: "พิมพ์ชื่อสินค้า บทความ หรือหน้าเว็บที่ต้องการค้นหา", en: "Type a product, article or page to search for", zh: "输入要搜索的产品、文章或页面", ko: "찾으시는 제품, 기사 또는 페이지를 입력하세요", ja: "製品・記事・ページ名を入力してください", my: "ရှာလိုသော ထုတ်ကုန်၊ ဆောင်းပါး သို့မဟုတ် စာမျက်နှာကို ရိုက်ထည့်ပါ", lo: "ພິມຊື່ສິນຄ້າ, ບົດຄວາມ ຫຼື ໜ້າເວັບທີ່ຕ້ອງການຄົ້ນຫາ", vi: "Nhập sản phẩm, bài viết hoặc trang cần tìm", ms: "Taip produk, artikel atau halaman untuk dicari" },
  searchNothing: { th: "ไม่พบผลลัพธ์ ลองใช้คำค้นอื่น", en: "Nothing found. Try another search term.", zh: "未找到结果，请尝试其他关键词。", ko: "결과가 없습니다. 다른 검색어를 입력해 보세요.", ja: "見つかりませんでした。別のキーワードをお試しください。", my: "ရလဒ် မတွေ့ပါ။ အခြားစကားလုံးဖြင့် ရှာကြည့်ပါ။", lo: "ບໍ່ພົບຜົນລັບ ລອງໃຊ້ຄຳຄົ້ນອື່ນ", vi: "Không tìm thấy. Hãy thử từ khóa khác.", ms: "Tiada hasil. Cuba kata carian lain." },
  pages: { th: "หน้าเว็บ", en: "Pages", zh: "页面", ko: "페이지", ja: "ページ", my: "စာမျက်နှာများ", lo: "ໜ້າເວັບ", vi: "Trang", ms: "Halaman" },
  previous: { th: "ก่อนหน้า", en: "Previous", zh: "上一页", ko: "이전", ja: "前へ", my: "ယခင်", lo: "ກ່ອນໜ້າ", vi: "Trước", ms: "Sebelumnya" },
  next: { th: "ถัดไป", en: "Next", zh: "下一页", ko: "다음", ja: "次へ", my: "နောက်", lo: "ຖັດໄປ", vi: "Tiếp", ms: "Seterusnya" },
  pageOf: { th: "หน้า {page} จาก {total}", en: "Page {page} of {total}", zh: "第 {page} 页，共 {total} 页", ko: "{total}페이지 중 {page}페이지", ja: "{total} ページ中 {page} ページ", my: "စာမျက်နှာ {total} ခုအနက် {page}", lo: "ໜ້າ {page} ຈາກ {total}", vi: "Trang {page} / {total}", ms: "Halaman {page} daripada {total}" },
  back: { th: "← กลับ", en: "← Back", zh: "← 返回", ko: "← 뒤로", ja: "← 戻る", my: "← နောက်သို့", lo: "← ກັບຄືນ", vi: "← Quay lại", ms: "← Kembali" },
  searchPlaceholder: { th: "ค้นหาสินค้าหรือบทความ...", en: "Search products or articles...", zh: "搜索产品或文章...", ko: "제품 또는 기사 검색...", ja: "製品や記事を検索...", my: "ထုတ်ကုန် သို့မဟုတ် ဆောင်းပါး ရှာရန်...", lo: "ຄົ້ນຫາສິນຄ້າ ຫຼື ບົດຄວາມ...", vi: "Tìm sản phẩm hoặc bài viết...", ms: "Cari produk atau artikel..." },
} satisfies Record<string, Entry>;

export type UiKey = keyof typeof UI;

/** UI label in `locale`, falling back to Thai. */
export function ui(locale: string, key: UiKey): string {
  const entry: Entry = UI[key];
  return entry[locale as keyof Entry] || entry.th;
}

/** UI label with {placeholders} filled in, e.g. uiFormat("en", "itemsCount", { n: 3 }). */
export function uiFormat(locale: string, key: UiKey, vars: Record<string, string | number>): string {
  return ui(locale, key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

/** Bound translator: const t = uiFor(locale); t("home"). */
export function uiFor(locale: string) {
  return (key: UiKey) => ui(locale, key);
}

const DATE_LOCALES: Record<string, string> = {
  th: "th-TH",
  en: "en-GB",
  zh: "zh-CN",
  ko: "ko-KR",
  ja: "ja-JP",
  my: "my-MM",
  lo: "lo-LA",
  vi: "vi-VN",
  ms: "ms-MY",
};

/** Long date in the visitor's language (Thai uses the Buddhist calendar, as before). */
export function formatDate(locale: string, iso: string | Date): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale] ?? "th-TH", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Bangkok" });
}
