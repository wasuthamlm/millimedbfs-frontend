// Brings the Navbar and the "เกี่ยวกับเรา" / "มาตรฐานผู้ผลิต" pages in line with the
// legacy site (https://millimedbfs.com, a base44 app) WITHOUT hardcoding anything into
// the React tree: every change here writes the exact same shapes the admin Server Actions
// write, so the result stays editable at /admin/menus, /admin/pages and /admin/media.
//
//   NavLink.active                      <- app/admin/menus/actions.ts (toggleNavLink)
//   PageSection.config {sourceLabel,anchorId,bodyTh,imageUrl}
//                                       <- app/admin/pages/[slug]/actions.ts (saveSections)
//   Media row + Supabase Storage upload <- app/api/admin/media/route.ts
//
// Source of the copy: the legacy app's public entity API, e.g.
//   https://base44.app/api/apps/6a3b5c8792d2ab82b92dcadf/entities/PageSection?limit=500
// The prose below is transcribed from PageSection.body_th / config.columns_data of the
// legacy pages `about`, `manufacturing-standard` and `manufacturing-technology`.
//
// Writes Supabase primary (DATABASE_URL) first, then mirrors to local (LOCAL_DATABASE_URL).
// Re-runnable: pages are upserted by slug, nav rows are resolved by href, and the sections
// of the pages in scope are replaced wholesale (exactly what the admin's save does).
import "dotenv/config";
import { randomUUID } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { uploadToStorage } from "../lib/supabase-storage";

type Db = PrismaClient;

const B44 = "https://base44.app/api/apps/6a3b5c8792d2ab82b92dcadf/files/mp/public/6a3b5c8792d2ab82b92dcadf/";

// key -> legacy URL. Re-hosted to Supabase Storage because next.config.ts's
// images.remotePatterns only allows *.supabase.co.
const LEGACY_IMAGES: Record<string, string> = {
  founder: B44 + "d59ebf676_content_1787207972480.webp",
  ceo: B44 + "f679edd81_content_1787207989559.webp",
  md: B44 + "f2241ffac_content_1787208012550.webp",
  cert1: B44 + "25bb0d5da_content_1786351611471.png",
  cert2: B44 + "e319b2d3f_content_1787191883664.webp",
};

const SOURCE_LABEL = "เขียนเนื้อหาเอง";

type SectionSeed = {
  titleTh: string;
  titleEn?: string;
  bodyTh: string;
  imageKey?: string;
  anchorId?: string;
  columns?: number;
};

type PageSeed = {
  slug: string;
  titleTh: string;
  titleEn: string;
  seoTitle?: string;
  seoDesc?: string;
  sections: SectionSeed[];
};

const DEFAULT_SEO_DESC =
  "Millimed BFS เชียงราย ผลิตยา อาหารเสริม เครื่องสำอาง น้ำตาเทียม OEM กำลังผลิตกว่า 1 ล้านหน่วย/วัน ได้รับรางวัล Thai FDA Quality Award ส่งออกญี่ปุ่น ตะวันออกกลาง และอาเซียน ดูรายละเอียด";

// ───────────────────────── content: /about ─────────────────────────

const ABOUT: PageSeed = {
  slug: "about",
  titleTh: "เกี่ยวกับเรา",
  titleEn: "About Us",
  seoTitle: "Millimed BFS ผู้ผลิตยา เครื่องสำอาง น้ำตาเทียม พร้อมรับ OEM",
  seoDesc: DEFAULT_SEO_DESC,
  sections: [
    {
      titleTh: "ประธานและผู้ก่อตั้งกลุ่มบริษัท มิลลิเมด",
      titleEn: "Chairman & Founder",
      imageKey: "founder",
      columns: 2,
      bodyTh:
        "<p><strong>คุณทองเปลว ศิริพรพิทักษ์</strong> ประธานและผู้ก่อตั้งกลุ่มบริษัท มิลลิเมด ด้วยประสบการณ์ในอุตสาหกรรมยามากกว่า 40 ปี และเป็นกำลังสำคัญในการขับเคลื่อนองค์กรมาอย่างต่อเนื่องยาวนานกว่า 26 ปี โดยมีบทบาทสำคัญในการกำหนดวิสัยทัศน์และทิศทางการดำเนินธุรกิจ มุ่งสู่ความเป็นเลิศด้านการผลิต การเติบโตอย่างยั่งยืน และการสร้างคุณค่าให้แก่สังคม</p>" +
        "<p>ตลอดระยะเวลาที่ผ่านมา ให้ความสำคัญกับการพัฒนาศักยภาพขององค์กรอย่างต่อเนื่อง ทั้งด้านการผลิต การพัฒนาผลิตภัณฑ์ และการนำเทคโนโลยีที่ทันสมัยมาใช้ ผ่านการลงทุนในเครื่องจักรและเทคโนโลยีที่ได้มาตรฐานระดับสากล เพื่อยกระดับประสิทธิภาพ เสริมสร้างขีดความสามารถในการแข่งขัน และวางรากฐานที่แข็งแกร่งสำหรับการเติบโตในระยะยาว</p>" +
        "<p>ภายใต้การนำของคุณทองเปลว กลุ่มบริษัท มิลลิเมด ได้เติบโตอย่างมั่นคง พร้อมสร้างความเชื่อมั่นให้แก่คู่ค้า ลูกค้า และสังคม ด้วยการดำเนินธุรกิจที่ให้ความสำคัญกับ <strong>คุณภาพ นวัตกรรม และความรับผิดชอบ</strong> ควบคู่ไปกับการพัฒนาองค์กรให้พร้อมรับการเปลี่ยนแปลงและก้าวสู่อนาคตอย่างยั่งยืน</p>",
    },
    {
      titleTh: "ประธานบริหาร",
      titleEn: "Chief Executive Officer",
      imageKey: "ceo",
      columns: 2,
      bodyTh:
        "<p>ในฐานะผู้นำองค์กรรุ่นใหม่ที่มีประสบการณ์กว่า <strong>25 ปีในอุตสาหกรรมยาและผลิตภัณฑ์เสริมอาหาร</strong> มีความเชี่ยวชาญด้านกลยุทธ์การตลาด การบริหารจัดการองค์กร และการพัฒนาธุรกิจ พร้อมวิสัยทัศน์ในการขับเคลื่อนองค์กรให้เติบโตอย่างมั่นคง และปรับตัวให้พร้อมรับกับการเปลี่ยนแปลงของอุตสาหกรรมและเทคโนโลยีในอนาคต</p>" +
        "<p>ให้ความสำคัญกับการพัฒนาและผลิตผลิตภัณฑ์ยาที่มี <strong>คุณภาพ ประสิทธิภาพ และความปลอดภัย</strong> ควบคู่กับการยกระดับกระบวนการทำงาน การนำเทคโนโลยีและนวัตกรรมมาประยุกต์ใช้ และการพัฒนาศักยภาพขององค์กรอย่างต่อเนื่อง เพื่อเพิ่มขีดความสามารถในการแข่งขันและรองรับการเติบโตในระยะยาว</p>" +
        "<p>ด้วยความมุ่งมั่นในการดำเนินธุรกิจอย่างมีความรับผิดชอบ เป้าหมายสำคัญคือการส่งมอบผลิตภัณฑ์ที่มีคุณภาพและได้มาตรฐานระดับสูง เพื่อสร้างความเชื่อมั่นให้แก่ผู้ป่วย ผู้บริโภค คู่ค้า และพันธมิตร พร้อมขับเคลื่อนกลุ่มบริษัท มิลลิเมด สู่การเติบโตอย่างยั่งยืน</p>",
    },
    {
      titleTh: "กรรมการผู้จัดการ",
      titleEn: "Managing Director",
      imageKey: "md",
      columns: 2,
      bodyTh:
        "<p>กรรมการผู้จัดการมีประสบการณ์กว่า <strong>28 ปีด้านการขายและการตลาดในอุตสาหกรรมยา</strong> พร้อมความเข้าใจเชิงลึกเกี่ยวกับธุรกิจโรงพยาบาล ระบบตลาดยา และบริบทของอุตสาหกรรมยาในประเทศไทย ทำให้สามารถเชื่อมโยงทิศทางเชิงกลยุทธ์เข้ากับโอกาสทางธุรกิจและความต้องการของตลาดได้อย่างมีประสิทธิภาพ</p>" +
        "<p>มีบทบาทสำคัญในการ <strong>ขับเคลื่อนกลยุทธ์ของกลุ่มบริษัทสู่การปฏิบัติ</strong> ถ่ายทอดนโยบายและเป้าหมายขององค์กรให้เกิดผลลัพธ์อย่างเป็นรูปธรรม ตลอดจนสร้างและรักษาความสัมพันธ์อันดีกับลูกค้า คู่ค้า พันธมิตรทางธุรกิจ และผู้มีส่วนได้ส่วนเสียทุกภาคส่วน</p>" +
        "<p>นอกจากนี้ ยังให้ความสำคัญกับการสร้าง วัฒนธรรมองค์กรที่เข้มแข็ง การทำงานร่วมกันเป็นทีม และการพัฒนาศักยภาพของบุคลากร เพื่อเสริมสร้างประสิทธิภาพในการดำเนินงาน และขับเคลื่อนกลุ่มบริษัท มิลลิเมด ให้เติบโตอย่างมั่นคงและยั่งยืน</p>",
    },
    {
      titleTh: "เกี่ยวกับเรา",
      titleEn: "About Us",
      anchorId: "about",
      bodyTh:
        "<p><strong>บริษัท มิลลิเมด บีเอฟเอส จำกัด (Millimed BFS Co., Ltd.)</strong> ก่อตั้งขึ้นในปี 2558 โดยกลุ่มบริษัท มิลลิเมด เพื่อรองรับความต้องการด้านผลิตภัณฑ์สุขภาพที่เพิ่มขึ้น พร้อมจัดตั้งโรงงานแห่งใหม่ในจังหวัดเชียงราย โดยมุ่งเน้นการผลิตด้วยเทคโนโลยีที่ทันสมัย มีประสิทธิภาพ และได้มาตรฐาน</p>" +
        "<p>บริษัทได้รับอนุญาตให้ผลิต ยา ผลิตภัณฑ์เสริมอาหาร เครื่องสำอาง และเครื่องมือแพทย์ ทั้งภายใต้แบรนด์ของบริษัทและรับจ้างผลิตแบบ OEM โดยให้ความสำคัญกับคุณภาพ ความปลอดภัย และการปฏิบัติตามมาตรฐานทั้งในประเทศและระดับสากล</p>" +
        "<p>ปัจจุบัน Millimed BFS เป็นหนึ่งในผู้ผลิต น้ำตาเทียมรายสำคัญของประเทศไทย ด้วยกำลังการผลิตประมาณ 1 ล้านหน่วยต่อวัน และมีเครื่องจักรสำหรับผลิตบลิสเตอร์และบรรจุกล่องรวม 14 เครื่อง รองรับการผลิตยารูปแบบของแข็งชนิดรับประทานได้สูงถึง 7 ล้านบลิสเตอร์ต่อวัน</p>" +
        "<p>กลุ่มบริษัท มิลลิเมด มีประสบการณ์ในอุตสาหกรรมยามากกว่า 25 ปี โดยเข้าซื้อกิจการ Bayer Laboratories Co., Ltd. ในปี 2543 และ Glaxo Wellcome Vidhayasom Co., Ltd. ในปี 2546 ก่อนก่อตั้งแบรนด์ Millimed อย่างเป็นทางการในปีเดียวกัน และเปิดตัวแบรนด์ผลิตภัณฑ์เสริมอาหาร Neoca ในปี 2549 ปัจจุบันกลุ่มบริษัทมีพนักงานประมาณ 1,000 คน โดยประมาณ 300 คนปฏิบัติงานที่ Millimed BFS</p>" +
        "<p>โรงงาน Millimed BFS ตั้งอยู่บนพื้นที่ประมาณ 200 ไร่ ในตำบลผางาม อำเภอเวียงชัย จังหวัดเชียงราย ใกล้สนามบินนานาชาติเชียงราย ระบบรถไฟ และเส้นทาง R3A ที่เชื่อมโยงจีน ลาว และไทย ช่วยสนับสนุนการขนส่งทั้งในและต่างประเทศ</p>" +
        "<p>บริเวณใกล้เคียงยังเป็นที่ตั้งของ คุ้มแสนสุข เอสเตท (Kumsaensuk Estate) ฟาร์มสมุนไพรออร์แกนิกขนาดกว่า 2,000 ไร่ ซึ่งสะท้อนวิสัยทัศน์ด้านการพัฒนาสุขภาพและคุณภาพชีวิตของคนไทยอย่างยั่งยืน</p>",
    },
    {
      titleTh: "รางวัลและการยอมรับ",
      titleEn: "Awards & Recognition",
      bodyTh:
        "<p>ผลงานด้านคุณภาพการผลิตและความรับผิดชอบต่อสังคมของบริษัทที่ได้รับการยอมรับอย่างต่อเนื่อง อาทิ</p>" +
        "<ul><li>Thai FDA Quality Award</li>" +
        "<li>รางวัลสถานประกอบการปลอดโรค ปลอดภัย กายใจเป็นสุข ระดับ Gold</li>" +
        "<li>รางวัล TO BE NUMBER ONE 2025 ระดับ Silver</li>" +
        "<li>รางวัลผลงานดีเด่นด้านการป้องกันและแก้ไขปัญหายาเสพติด ประจำปี 2025</li></ul>" +
        "<p>นอกจากนี้ กลุ่มบริษัท มิลลิเมด ยังเคยได้รับ Thailand Top SME Awards – Fastest Growing Business of the Year 2017 และ Prime Minister’s Best Exporter Award 2018</p>",
    },
    {
      titleTh: "ลูกค้าและตลาดทั่วโลก",
      titleEn: "Customers & Global Markets",
      bodyTh:
        "<p><strong>Millimed BFS Co., Ltd.</strong> เป็นพันธมิตรด้านการผลิตผลิตภัณฑ์ยาแบบ <strong>OEM</strong> ที่มีคุณภาพสูง ให้แก่แบรนด์และพันธมิตรทางธุรกิจ ในประเทศไทย และตลาดต่างประเทศ ด้วยศักยภาพด้านการผลิต ระบบควบคุมคุณภาพ และกระบวนการดำเนินงานที่สอดคล้องกับข้อกำหนดและมาตรฐานที่เป็นที่ยอมรับ</p>" +
        "<p>ด้วยความมุ่งมั่นในการรักษาคุณภาพและมาตรฐานการผลิตอย่างต่อเนื่อง Millimed BFS ได้รับความไว้วางใจจากลูกค้าในหลากหลายตลาด ครอบคลุมทั้ง <strong>ประเทศญี่ปุ่น กลุ่มประเทศตะวันออกกลาง และประเทศสมาชิกอาเซียน</strong> สะท้อนถึงความสามารถในการตอบสนองต่อข้อกำหนดและความต้องการที่แตกต่างกันของแต่ละประเทศ</p>" +
        "<p><strong>ก้าวสู่ตลาดโลกด้วยคุณภาพและมาตรฐานการผลิตที่ได้รับความไว้วางใจ</strong></p>" +
        "<p>Millimed BFS พร้อมเดินหน้าขยายความร่วมมือกับพันธมิตรในตลาดต่างประเทศ และพัฒนาศักยภาพด้านการผลิตอย่างต่อเนื่อง เพื่อส่งมอบผลิตภัณฑ์ที่มีคุณภาพ สร้างความเชื่อมั่น และเติบโตไปพร้อมกับพันธมิตรทางธุรกิจอย่างยั่งยืน</p>",
    },
    {
      titleTh: "ความยั่งยืนและความรับผิดชอบต่อสังคม",
      titleEn: "Sustainability & Social Responsibility",
      bodyTh:
        "<p>Millimed BFS ให้ความสำคัญกับการส่งเสริมสุขภาพและคุณภาพชีวิตอย่างรอบด้าน โดยสนับสนุนทั้ง <strong>นโยบายระดับประเทศ พนักงาน ชุมชนในจังหวัดเชียงราย สิ่งแวดล้อม และประชาชนไทย</strong> ผ่านกิจกรรมเพื่อสังคม การบริจาค และการมีส่วนร่วมกับชุมชนอย่างต่อเนื่อง</p>" +
        "<h3>สนับสนุนเป้าหมายระดับประเทศ</h3>" +
        "<p>บริษัทมีส่วนร่วมในการสนับสนุนโครงการที่ช่วยพัฒนาสังคมและเยาวชนไทย อาทิ</p>" +
        "<ul><li><strong>โครงการ TO BE NUMBER ONE ระดับประเทศ</strong></li>" +
        "<li><strong>โครงการป้องกันและแก้ไขปัญหายาเสพติด</strong></li></ul>" +
        "<h3>สนับสนุนและช่วยเหลือสังคมไทย</h3>" +
        "<p>Millimed BFS ดำเนินกิจกรรมเพื่อช่วยเหลือชุมชนและสังคมในหลายด้าน เช่น</p>" +
        "<ul><li>บริจาค <strong>ยา อาหาร และสิ่งของจำเป็น</strong> ให้แก่โรงพยาบาลและพื้นที่ที่ได้รับผลกระทบจากภัยพิบัติ</li>" +
        "<li>สนับสนุน <strong>ทุนการศึกษาสำหรับนักศึกษาแพทย์และผู้ช่วยพยาบาล</strong> ในสถาบันต่าง ๆ เช่น มหาวิทยาลัยแม่ฟ้าหลวง โรงพยาบาลศิริราช มหาวิทยาลัยมหิดล และมหาวิทยาลัยขอนแก่น</li></ul>" +
        "<h3>การสนับสนุนด้านสิ่งแวดล้อม</h3>" +
        "<p><strong>Support the Environment</strong></p>" +
        "<p>Millimed BFS ให้ความสำคัญกับการดำเนินธุรกิจควบคู่กับการดูแลสิ่งแวดล้อม โดยมุ่งลดผลกระทบจากกระบวนการผลิตและใช้ทรัพยากรอย่างมีประสิทธิภาพ ผ่านโครงการสำคัญ ได้แก่</p>" +
        "<ul><li><strong>โครงการ Solar Rooftop</strong> เพื่อช่วยลดการปล่อยก๊าซคาร์บอน และเสริมความมั่นคงด้านพลังงานในระยะยาว</li>" +
        "<li>ใช้ระบบบำบัดน้ำเสีย <strong>Membrane Bio Reactor (MBR)</strong> เพื่อเพิ่มประสิทธิภาพในการนำน้ำกลับมาใช้ใหม่ ช่วยอนุรักษ์ทรัพยากรน้ำ และลดมลพิษที่อาจเกิดขึ้นต่อสิ่งแวดล้อม</li></ul>" +
        "<p>นอกจากนี้ บริษัทยังส่งเสริมกิจกรรมที่เกี่ยวข้องกับการดูแลพื้นที่สีเขียวและการมีส่วนร่วมของบุคลากร เพื่อสนับสนุนแนวทางการพัฒนาอย่างยั่งยืน</p>" +
        "<h3>การดูแลและสนับสนุนพนักงาน</h3>" +
        "<p><strong>Support Our Employees</strong></p>" +
        "<p>Millimed BFS ให้ความสำคัญกับคุณภาพชีวิตและความเป็นอยู่ของพนักงาน รวมถึงครอบครัว ผ่านสวัสดิการและกิจกรรมสนับสนุนอย่างต่อเนื่อง อาทิ</p>" +
        "<ul><li><strong>มอบทุนการศึกษาแก่บุตรของพนักงาน</strong></li>" +
        "<li><strong>มอบเงินช่วยเหลือและผลิตภัณฑ์ยาเป็นประจำทุกปี</strong></li></ul>" +
        "<p>บริษัทมุ่งสร้างสภาพแวดล้อมการทำงานที่ดี พร้อมสนับสนุนความมั่นคงและคุณภาพชีวิตของพนักงานในระยะยาว เพื่อให้บุคลากรเติบโตไปพร้อมกับองค์กรอย่างยั่งยืน</p>",
    },
    {
      titleTh: "ข้อมูลการติดต่อ",
      titleEn: "Contact Information",
      bodyTh:
        "<p><strong>Millimed BFS Company Limited</strong></p>" +
        "<p><strong>บริษัท มิลลิเมด บีเอฟเอส จำกัด</strong></p>" +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-top:1rem;">' +
        "<div><h3>โรงงาน จังหวัดเชียงราย</h3><p>174, 179 หมู่ 8 ตำบลผางาม</p><p>อำเภอเวียงชัย จังหวัดเชียงราย ประเทศไทย</p><p><strong>โทร:</strong> +66 2 945 9555</p></div>" +
        "<div><h3>สำนักงานกรุงเทพฯ</h3><p>821 ถนนรามอินทรา แขวงท่าแร้ง</p><p>เขตบางเขน กรุงเทพมหานคร 10230</p><p><strong>โทร:</strong> +66 2 945 9555</p><p><strong>แฟกซ์:</strong> +66 2 945 8642</p></div>" +
        '<div><h3>ติดต่อธุรกิจต่างประเทศ</h3><p><strong>ผู้ติดต่อ:</strong> Thannari Pukraweeroj</p><p><strong>อีเมล:</strong> <a target="_blank" rel="noopener noreferrer nofollow" href="mailto:Thannari@millimedbfs.com">Thannari@millimedbfs.com</a></p><p><strong>โทร:</strong> +66 5 164 9959</p></div>' +
        "</div>",
    },
  ],
};

// ───────────────────── content: /manufacturing-standard ─────────────────────
// The legacy page is a single block holding two certificate images. BlockBodyText
// renders config.bodyTh as HTML once it sees a tag, so both images live in one block
// (config.imageUrl only holds one). CERT_PLACEHOLDER is swapped for the re-hosted URLs.

const CERT_PLACEHOLDER = "__CERT_IMAGES__";

const MANUFACTURING_STANDARD: PageSeed = {
  slug: "manufacturing-standard",
  titleTh: "มาตรฐานการผลิต",
  titleEn: "Manufacturing Standard",
  seoTitle: "Millimed BFS ผู้ผลิตยา เครื่องสำอาง น้ำตาเทียม พร้อมรับ OEM",
  seoDesc: DEFAULT_SEO_DESC,
  // The legacy site shows the page name in a hero band; this project has no page hero on
  // CMS pages, so the block heading carries it instead.
  sections: [{ titleTh: "มาตรฐานการผลิต", titleEn: "Manufacturing Standard", bodyTh: CERT_PLACEHOLDER }],
};

// The legacy "เทคโนโลยีการผลิต" copy already lives on this DB under the slug
// `manufacturing-standards` — it gets renamed in place rather than re-imported.
const TECHNOLOGY = {
  oldSlug: "manufacturing-standards",
  slug: "manufacturing-technology",
  titleTh: "เทคโนโลยีการผลิต",
  titleEn: "Manufacturing Technologies",
  seoTitle: "เทคโนโลยีการผลิต Millimed BFS | Blow-Fill-Seal",
  seoDesc:
    "เทคโนโลยีและเครื่องจักรการผลิตของ Millimed BFS รวมเครื่อง Blow-Fill-Seal BP460 มาตรฐานจากประเทศเยอรมนี เพื่อความแม่นยำและปลอดเชื้อในการผลิต",
};

// ───────────────────────── helpers ─────────────────────────

function client(connectionString: string): Db {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Mirrors app/api/admin/media/route.ts: random-uuid object name at the bucket root.
// A previously uploaded copy is reused (looked up by the `legacy-<key>` filename on the
// primary DB) so re-runs don't pile up duplicate objects — and, more importantly, so the
// local mirror ends up pointing at the SAME URLs as primary.
async function rehostImages(primary: Db): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const [key, legacyUrl] of Object.entries(LEGACY_IMAGES)) {
    const known = await primary.media.findFirst({ where: { filename: { startsWith: "legacy-" + key + "." } } });
    if (known) {
      out[key] = known.url;
      console.log("  image " + key + ": reusing " + known.url);
      continue;
    }
    const res = await fetch(legacyUrl);
    if (!res.ok) throw new Error("download failed " + res.status + " for " + legacyUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/webp";
    const ext = "." + (contentType.split("/")[1]?.split(";")[0] ?? "bin");
    out[key] = await uploadToStorage(randomUUID() + ext, buffer, contentType);
    console.log("  image " + key + " -> " + out[key] + " (" + buffer.length + " bytes)");
  }
  return out;
}

// A Media row per uploaded file, so the images show up in /admin/media and can be
// re-picked from the media library later.
async function registerMedia(db: Db, images: Record<string, string>) {
  for (const [key, url] of Object.entries(images)) {
    if (await db.media.findFirst({ where: { url } })) continue;
    const head = await fetch(url, { method: "HEAD" });
    await db.media.create({
      data: {
        url,
        filename: "legacy-" + key + url.slice(url.lastIndexOf(".")),
        mimeType: head.headers.get("content-type") ?? "image/webp",
        size: Number(head.headers.get("content-length") ?? 0),
      },
    });
  }
}

// Same write shape as saveSections(): upsert the Page, then replace ALL its sections.
async function writePage(db: Db, seed: PageSeed, images: Record<string, string>) {
  const page = await db.page.upsert({
    where: { slug: seed.slug },
    update: {
      titleTh: seed.titleTh,
      titleEn: seed.titleEn,
      status: "PUBLISHED",
      archived: false,
      seoTitle: seed.seoTitle ?? null,
      seoDesc: seed.seoDesc ?? null,
    },
    create: {
      slug: seed.slug,
      titleTh: seed.titleTh,
      titleEn: seed.titleEn,
      status: "PUBLISHED",
      seoTitle: seed.seoTitle ?? null,
      seoDesc: seed.seoDesc ?? null,
    },
  });

  await db.pageSection.deleteMany({ where: { pageId: page.id } });

  for (let i = 0; i < seed.sections.length; i++) {
    const s = seed.sections[i];
    await db.pageSection.create({
      data: {
        pageId: page.id,
        order: i,
        type: "COMPANY_INTRO",
        titleTh: s.titleTh,
        titleEn: s.titleEn ?? null,
        visibleDesktop: true,
        visibleTablet: true,
        visibleMobile: true,
        columns: s.columns ?? null,
        itemsToShow: null,
        config: {
          sourceLabel: SOURCE_LABEL,
          anchorId: s.anchorId ?? "",
          bodyTh: s.bodyTh,
          imageUrl: s.imageKey ? images[s.imageKey] : "",
        },
      },
    });
  }
  console.log("  page " + seed.slug + ": " + seed.sections.length + " section(s)");
}

// Rename in place — an upsert keyed on slug would clone the page and leave the old
// row (with its sections) behind. Also clears the malformed anchorId "/standard",
// which Next renders as id="/standard" on the section wrapper.
async function renameTechnologyPage(db: Db) {
  const old = await db.page.findUnique({ where: { slug: TECHNOLOGY.oldSlug } });
  const current = await db.page.findUnique({ where: { slug: TECHNOLOGY.slug } });

  if (old && current) {
    throw new Error(
      'both "' + TECHNOLOGY.oldSlug + '" and "' + TECHNOLOGY.slug + '" exist — resolve by hand',
    );
  }
  if (old) {
    await db.page.update({
      where: { id: old.id },
      data: {
        slug: TECHNOLOGY.slug,
        titleTh: TECHNOLOGY.titleTh,
        titleEn: TECHNOLOGY.titleEn,
        status: "PUBLISHED",
        archived: false,
        seoTitle: TECHNOLOGY.seoTitle,
        seoDesc: TECHNOLOGY.seoDesc,
      },
    });
    console.log("  page " + TECHNOLOGY.oldSlug + " -> " + TECHNOLOGY.slug);
  } else if (current) {
    console.log("  page " + TECHNOLOGY.slug + ": already renamed");
  } else {
    console.warn("  !! neither " + TECHNOLOGY.oldSlug + " nor " + TECHNOLOGY.slug + " found");
    return;
  }

  const target = await db.page.findUnique({
    where: { slug: TECHNOLOGY.slug },
    include: { sections: true },
  });
  for (const section of target?.sections ?? []) {
    const config = (section.config as Record<string, unknown> | null) ?? {};
    const data: { config?: object; titleTh?: string; titleEn?: string } = {};
    // "/standard" is not a usable HTML id — it lands on the section wrapper as id="/standard".
    if (config.anchorId === "/standard") data.config = { ...config, anchorId: "" };
    // The block still carries the heading from when this page was "มาตรฐานผู้ผลิต".
    if (section.titleTh === "มาตรฐานผู้ผลิต") {
      data.titleTh = TECHNOLOGY.titleTh;
      data.titleEn = TECHNOLOGY.titleEn;
    }
    if (Object.keys(data).length === 0) continue;
    await db.pageSection.update({ where: { id: section.id }, data });
    console.log("  tidied section " + section.order + " (" + Object.keys(data).join(", ") + ")");
  }
}

// Same semantics as toggleNavLink(): hide, never delete (NavChildren cascades on delete).
async function hideNavTree(db: Db, href: string, label: string) {
  const row = await db.navLink.findFirst({ where: { placement: "HEADER", href, parentId: null } });
  if (!row) {
    console.warn('  !! nav "' + label + '" (' + href + ") not found");
    return;
  }
  let hidden = 0;
  const walk = async (parentId: string) => {
    for (const child of await db.navLink.findMany({ where: { parentId } })) {
      await db.navLink.update({ where: { id: child.id }, data: { active: false } });
      hidden++;
      await walk(child.id);
    }
  };
  await db.navLink.update({ where: { id: row.id }, data: { active: false } });
  await walk(row.id);
  console.log('  nav "' + label + '": hidden (+' + hidden + " descendant item(s))");
}

// "มาตรฐานผู้ผลิต" becomes a dropdown parent over the two legacy sub-pages.
// An empty parent href is what NavDropdown renders as non-clickable (like "อาคารโรงงาน").
async function buildStandardsMenu(db: Db) {
  const parent =
    (await db.navLink.findFirst({
      where: { placement: "HEADER", parentId: null, href: "/manufacturing-standards" },
    })) ??
    (await db.navLink.findFirst({
      where: { placement: "HEADER", parentId: null, href: "" , labelTh: "มาตรฐานผู้ผลิต" },
    })) ??
    (await db.navLink.findFirst({
      where: { placement: "HEADER", parentId: null, labelTh: "มาตรฐานผู้ผลิต" },
    }));

  if (!parent) {
    console.warn('  !! nav "มาตรฐานผู้ผลิต" not found');
    return;
  }

  await db.navLink.update({
    where: { id: parent.id },
    data: { labelTh: "มาตรฐานผู้ผลิต", labelEn: "Manufacturing Standards", href: "", active: true },
  });

  const children = [
    { labelTh: "มาตรฐานการผลิต", labelEn: "Manufacturing Standard", href: "/manufacturing-standard" },
    { labelTh: "เทคโนโลยีการผลิต", labelEn: "Manufacturing Technology", href: "/manufacturing-technology" },
  ];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // keyed on parentId + href — never on the label, which is editable from /admin/menus
    const existing = await db.navLink.findFirst({ where: { parentId: parent.id, href: child.href } });
    if (existing) {
      await db.navLink.update({
        where: { id: existing.id },
        data: { labelTh: child.labelTh, labelEn: child.labelEn, order: i, active: true },
      });
    } else {
      await db.navLink.create({
        data: {
          labelTh: child.labelTh,
          labelEn: child.labelEn,
          href: child.href,
          parentId: parent.id,
          order: i,
          active: true,
          placement: "HEADER",
        },
      });
    }
  }
  console.log('  nav "มาตรฐานผู้ผลิต": dropdown with ' + children.length + " child item(s)");
}

// The footer's "เมนูลัด" column (edited at /admin/site/footer) still points at the
// pre-rename slug. Repoint it at the new "มาตรฐานการผลิต" page so it doesn't 404.
async function fixFooterLinks(db: Db) {
  const stale = await db.footerLink.findMany({ where: { href: "/manufacturing-standards" } });
  for (const link of stale) {
    await db.footerLink.update({ where: { id: link.id }, data: { href: "/manufacturing-standard" } });
  }
  if (stale.length) console.log("  footer: repointed " + stale.length + " link(s) to /manufacturing-standard");
}

async function applyAll(label: string, connectionString: string, images: Record<string, string>) {
  console.log("\n[" + label + "]");
  const db = client(connectionString);
  try {
    await registerMedia(db, images);
    await writePage(db, ABOUT, images);
    await writePage(
      db,
      {
        ...MANUFACTURING_STANDARD,
        sections: MANUFACTURING_STANDARD.sections.map((s) => ({
          ...s,
          bodyTh: s.bodyTh.replace(
            CERT_PLACEHOLDER,
            '<p><img src="' + images.cert1 + '"></p><p><br></p><p><img src="' + images.cert2 + '"></p>',
          ),
        })),
      },
      images,
    );
    await renameTechnologyPage(db);
    await hideNavTree(db, "/products", "สินค้า");
    await hideNavTree(db, "/articles", "บทความ");
    await buildStandardsMenu(db);
    await fixFooterLinks(db);
  } finally {
    await db.$disconnect();
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  console.log("Re-hosting legacy images to Supabase Storage…");
  const primary = client(process.env.DATABASE_URL);
  let images: Record<string, string>;
  try {
    images = await rehostImages(primary);
  } finally {
    await primary.$disconnect();
  }

  await applyAll("primary/Supabase", process.env.DATABASE_URL, images);

  const local = process.env.LOCAL_DATABASE_URL;
  if (!local) {
    console.warn("\n!! LOCAL_DATABASE_URL is not set — local backup NOT updated");
    return;
  }
  try {
    await applyAll("local", local, images);
  } catch (err) {
    console.warn("\n!! local backup NOT updated: " + (err instanceof Error ? err.message : String(err)));
    console.warn("   fix LOCAL_DATABASE_URL and re-run — this script is idempotent.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
