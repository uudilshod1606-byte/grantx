export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  tag: string;
  readTime: string;
  publishedDate: string;
  coverImage: string;
  coverCaption?: string;
  sections: GuideSection[];
  nextGuideNote?: string;
}

export const guides: Guide[] = [
  {
    slug: "189-ball-sari-yol",
    title: "189 ball sari yo'l",
    description:
      "DTM va Milliy sertifikat imtihonlariga tayyorgarlik bo'yicha amaliy qo'llanma. Intizom. Reja. Natija.",
    tag: "DTM & Milliy sertifikat",
    readTime: "8 daqiqa o'qish",
    publishedDate: "2026-08-10",
    coverImage: "/guides/189-ball-cover.png",
    coverCaption: "Intizom. Reja. Natija — 189 ball sari yo'l shu uchtasidan boshlanadi.",
    sections: [
      {
        heading: "1. Kimlar uchun",
        paragraphs: ["Ushbu qo'llanma quyidagi abituriyentlar uchun tayyorlangan:"],
        list: [
          "DTM imtihonidan yuqori natija olishni maqsad qilganlar.",
          "150+, 170+ yoki 189 ball olishni rejalashtirayotganlar.",
          "O'qishni qayerdan boshlashni bilmayotganlar.",
          "O'ziga samarali kunlik va haftalik o'qish rejasini tuzmoqchi bo'lganlar.",
          "Imtihongacha bo'lgan vaqtni to'g'ri taqsimlashni istaganlar.",
          "Test natijalarini muntazam tahlil qilib, xatolari ustida ishlashni xohlaydiganlar.",
          "Intizomli tayyorgarlik orqali o'z maqsadiga erishishni istagan barcha abituriyentlar.",
        ],
      },
      {
        heading: "2. DTM haqida qisqacha",
        paragraphs: [
          "Davlat oliy ta'lim muassasalarining bakalavriat ta'lim yo'nalishlariga qabul test sinovlari Bilim va malakalarni baholash agentligi (BMBA) tomonidan o'tkaziladi.",
          "Test sinovi ikki qismdan iborat: majburiy fanlar (Ona tili, Matematika, O'zbekiston tarixi) va mutaxassislik fanlari (1-fan va 2-fan, tanlangan yo'nalishga qarab belgilanadi).",
          "DTM test sinovi jami 90 ta topshiriqdan iborat. Majburiy fanlarning har birida 10 tadan savol bo'lib, har bir to'g'ri javob 1,1 balldan baholanadi (jami 30 savol — 33 ball). 1-mutaxassislik fanida 30 savol, har biri 3,1 balldan (maksimal 93 ball); 2-mutaxassislik fanida ham 30 savol, har biri 2,1 balldan (maksimal 63 ball) baholanadi.",
        ],
        list: [
          "Majburiy fanlar — 33 ball",
          "1-mutaxassislik fani — 93 ball",
          "2-mutaxassislik fani — 63 ball",
          "Jami — 189 ball",
          "Test davomiyligi — 3 soat (180 daqiqa)",
        ],
      },
      {
        heading: "3. DTMdan ko'ra milliy sertifikatlarga ustuvorlik bering",
        paragraphs: [
          "DTM orqali imtihon topshirishdan ko'ra, barcha 5 ta fandan milliy sertifikat olishni maqsad qilib qo'ying. Hozirgi kunda bu — maksimal ballni to'plashning eng oson va sinalgan usuli hisoblanadi.",
          "DTM imtihonida 2–3 ta xato qilsangiz, bu umumiy ballingizga sezilarli darajada salbiy ta'sir qiladi. Ammo milliy sertifikat topshirganda, eng yuqori — A darajasini olish uchun 5–6 tagacha xatoga yo'l qo'yish mumkin. Ya'ni milliy sertifikat tizimi xatolarga nisbatan ancha \"kechirimli\" va shu bois yuqori ball to'plash uchun ishonchliroq yo'ldir.",
        ],
      },
      {
        heading: "4. Tayyorgarlikni boshlashdan oldingi 5 ta qoida",
        list: [
          "Davomiylikni saqlang — bir kunda 6–7 soat o'qib, keyingi ikki kun umuman o'qimaslikdan ko'ra, har kuni 2–3 soat sifatli tayyorgarlik ko'rish ancha samaraliroq.",
          "Rejasiz o'qimang — har kuni nima o'qishingiz, qancha test ishlashingiz va qaysi mavzularni takrorlashingiz oldindan belgilangan bo'lsin.",
          "Xatolar ustida ishlang — har bir noto'g'ri javobni yozib boring va nima sababdan xato qilganingizni tahlil qiling.",
          "Natijani muntazam kuzatib boring — haftada kamida bir marta sinov testi ishlang va natijalaringizni tahlil qiling.",
          "Hozirgi holatingizni aniqlab oling — intil.lovable.app saytidan foydalanib, har oy qancha o'sish ko'rsatayotganingizni muntazam kuzatib boring.",
        ],
      },
      {
        heading: "5. Samarali tayyorgarlik tizimi",
        paragraphs: [
          "Yuqori natijaga erishish faqat ko'p o'qishga emas, balki to'g'ri tashkil etilgan tayyorgarlik tizimiga ham bog'liq.",
          "Vaqtni boshqarish: kunlik reja — qaysi fan va mavzularni o'rganishingiz, nechta test ishlashingiz hamda takrorlash uchun qancha vaqt ajratishingizni belgilang; haftalik reja — hafta davomida o'rganiladigan mavzularni taqsimlang va kamida bitta to'liq sinov testi ishlang; oylik maqsad — har oy yakunida qaysi mavzular tugallanishi kerakligini oldindan rejalashtiring.",
          "Takrorlash tizimi: yangi mavzularni o'rganishga vaqtning 70 foizini, oldingi mavzularni takrorlashga esa 30 foizini ajrating. Har hafta avval o'rganilgan mavzularni qisqacha qayta ko'rib chiqing va o'zingizni test orqali tekshiring.",
        ],
        list: [
          "Mavzu yakunlangach darhol test yeching.",
          "Vaqtni hisobga olgan holda ishlashni odat qiling.",
          "Xatolarning sababini tahlil qiling va shu mavzuni qayta takrorlang.",
        ],
      },
      {
        heading: "6. Samarali o'qish usullari",
        paragraphs: [
          "To'g'ri o'qish usulini tanlash tayyorgarlik samaradorligini sezilarli darajada oshiradi.",
        ],
        list: [
          "Pomodoro usuli — 25 daqiqa to'liq diqqat bilan o'qish, 5 daqiqa dam olish, 4 ta siklidan so'ng 15–30 daqiqa tanaffus.",
          "Faol esga tushirish (Active Recall) — mavzuni o'qib bo'lgach, kitobni yoping va o'zingizga savollar bering.",
          "Feynman usuli — biror mavzuni sodda tilda tushuntirishga harakat qiling; qiynalsangiz, mavzuni yana o'rganing.",
          "Test orqali o'rganish — har mavzudan so'ng test ishlang, xatolarni tahlil qilib, o'sha mavzuni qayta takrorlang.",
        ],
      },
      {
        heading: "7. Foydali resurslar va INTIL platformasi",
        paragraphs: [
          "Tayyorgarlikni, avvalo, maktab darsliklari va fan bo'yicha tavsiya etilgan qo'llanmalar asosida olib boring. Mavzularni to'liq o'zlashtirgandan so'ng, testlar orqali bilimingizni mustahkamlang.",
          "INTIL — DTM va Milliy sertifikat imtihonlariga tayyorgarlik ko'rayotgan abituriyentlar uchun yaratilgan zamonaviy onlayn platforma.",
        ],
        list: [
          "Fanlar bo'yicha testlar ishlash",
          "Natijalarni kuzatish",
          "Xatolarni tahlil qilish",
          "Muntazam ravishda yangi testlardan foydalanish",
          "Telegram kanal: t.me/intil_hamjamiyat",
          "INTIL platformasi: intil.lovable.app",
        ],
      },
    ],
    nextGuideNote:
      "Navbatdagi qo'llanmamiz Matematika va Ingliz tili fanlari bo'yicha maksimal ball to'plash strategiyasiga bag'ishlanadi.",
  },
];

export const getGuideBySlug = (slug: string) =>
  guides.find((guide) => guide.slug === slug);
