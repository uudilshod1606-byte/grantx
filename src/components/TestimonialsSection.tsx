import React from "react";

// INTIL — "Natijalar" bo'limi: o'quvchilar fikrlari
// Xuddi shu espresso/oltin va krem fon palitrasi

const accent = "#C9962E";
const accentDark = "#A47418";
const bg = "#FBF3E7";
const cardBorder = "#EADDC5";
const textPrimary = "#221C13";
const textSecondary = "#6B6152";

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={accent}>
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6L12 2Z" />
    </svg>
  );
}

const testimonials = [
  {
    before: 132,
    after: 156,
    name: "Sardor S.",
    quote:
      "Assalomu aleykum saytning anchagina foydasi tegdi, imtihonimda saytda ishlagan 3 savolim qaytib tushdi. Milliy sertifikat bo'limlari ham tezroq ishga tushurilsa zo'r bo'lardi.",
  },
  {
    before: 154,
    after: 169,
    name: "Madina Mahkamova",
    quote:
      "Assalomu aleykum hozirgina DTM balim aniq bo'ldi. Saytni juda foydasi tegdi. Qayerdan test ishlashni bilmay yurardim. Aynan mening soham bo'lgan biologiya va kimyo fanidagi savollar qiyinligi imtihondagi bilan bir xil.",
  },
  {
    before: 105,
    after: 129,
    name: "Komila Utkirova",
    quote:
      "Saytning juda katta foydasi tegdi, ayniqsa savollari. Imtihonimda 4 ta savol saytda ishlagan savollarim bilan qaytib tushdi.",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="natijalar" style={{ background: bg, padding: "88px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 44,
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
                marginBottom: 12,
              }}
            >
              O'quvchilar fikri
            </p>
            <h2
              style={{
                fontSize: 42,
                lineHeight: 1.1,
                fontWeight: 800,
                color: textPrimary,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Ballar ko'tarilmoqda.
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${cardBorder}`,
                borderRadius: 18,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#F3E2BA",
                    color: accentDark,
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 999,
                    padding: "5px 12px",
                  }}
                >
                  {t.before}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke={accentDark}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    background: accentDark,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 999,
                    padding: "5px 12px",
                  }}
                >
                  {t.after}
                </span>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: textPrimary, margin: "0 0 2px", fontSize: 15.5 }}>
                  {t.name}
                </p>
                <p style={{ color: textSecondary, margin: 0, fontSize: 12.5 }}>
                  Tasdiqlangan fikr
                </p>
              </div>

              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} />
                ))}
              </div>

              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: textPrimary,
                  margin: 0,
                }}
              >
                "{t.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
