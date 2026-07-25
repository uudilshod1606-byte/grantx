import React from "react";

// INTIL — "Hammasi bitta joyda" bo'limi
// Fon hero section bilan bir xil issiq krem rang — uzluksiz o'tish uchun

const accentDark = "#A47418";
const bg = "#FBF3E7";
const cardBorder = "#EADDC5";
const textPrimary = "#221C13";
const textSecondary = "#6B6152";
const iconBg = "#F3E2BA";

function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={accentDark} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="5" stroke={accentDark} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.4" fill={accentDark} />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5C4.7 20 4 19.3 4 18.5V5.5Z"
        stroke={accentDark}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5C20 4.7 19.3 4 18.5 4H12v16h6.5c0.8 0 1.5-0.7 1.5-1.5V5.5Z"
        stroke={accentDark}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"
        stroke={accentDark}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"
        stroke={accentDark}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M18 3v4h-4M6 21v-4h4" stroke={accentDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke={accentDark} strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke={accentDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  {
    icon: <IconTarget />,
    eyebrow: "To'liq sinovlar",
    title: "Haqiqiy imtihon muhitida ishlang",
    desc: "DTM va Milliy Sertifikat formatidagi vaqtli sinovlar bilan o'zingizni imtihonga tayyorlang.",
  },
  {
    icon: <IconBook />,
    eyebrow: "Savollar banki",
    title: "Kerakli mavzuni mashq qiling",
    desc: "Fan, mavzu va qiyinlik darajasi bo'yicha savollarni tanlab ishlang.",
  },
  {
    icon: <IconSpark />,
    eyebrow: "Yechim tahlili",
    title: "Har bir xatoni tushunib oling",
    desc: "Har bir savol uchun batafsil yechim va tushuntirish bilan xatolaringizni tahlil qiling.",
  },
  {
    icon: <IconRepeat />,
    eyebrow: "Formulalar",
    title: "Formulalarni mustahkamlang",
    desc: "Qiynalayotgan formulalarni takrorlab, ularni uzoq muddat eslab qoling.",
  },
  {
    icon: <IconHistory />,
    eyebrow: "Natijalar tarixi",
    title: "O'sishingizni kuzating",
    desc: "Sinov va mashq natijalaringiz qanday o'zgarayotganini grafik orqali ko'ring.",
  },
];

export default function PlatformFeaturesSection() {
  return (
    <section id="yonalish" style={{ background: bg, padding: "88px 24px" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: 64,
        }}
      >
        <div>
          <p
            style={{
              color: accentDark,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Hammasi bitta joyda
          </p>
          <h2
            style={{
              fontSize: 42,
              lineHeight: 1.12,
              fontWeight: 800,
              color: textPrimary,
              margin: "0 0 18px",
              letterSpacing: "-0.01em",
            }}
          >
            Tayyorlanish uchun kerak bo'lgan hamma narsa.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: textSecondary,
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Sinovlar, mavzular bo'yicha mashqlar, yechimlar, formulalar va
            natijalar tahlili — barchasi bir joyda.
          </p>
        </div>

        <div>
          {features.map((f, i) => (
            <div
              key={f.eyebrow}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr auto",
                alignItems: "center",
                gap: 20,
                padding: "22px 0",
                borderBottom: i === features.length - 1 ? "none" : `1px solid ${cardBorder}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {f.icon}
              </div>

              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: accentDark,
                    margin: "0 0 4px",
                  }}
                >
                  {f.eyebrow}
                </p>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: textPrimary,
                    margin: "0 0 4px",
                  }}
                >
                  {f.title}
                </p>
                <p style={{ fontSize: 14.5, color: textSecondary, margin: 0, lineHeight: 1.55 }}>
                  {f.desc}
                </p>
              </div>

              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="#C9B98A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
