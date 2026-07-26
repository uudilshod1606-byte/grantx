import React from "react";

// INTIL — amaliy mashq bo'limi
// Haqiqiy savol interfeysi uslubida: harfli doira belgilar, Oldingi/Keyingi tugmalari

const accent = "#C9962E";
const accentDark = "#A47418";
const bg = "#FBF3E7";
const cardBorder = "#EADDC5";
const textPrimary = "#221C13";
const textSecondary = "#6B6152";

const options = [
  { id: "A", value: "4" },
  { id: "B", value: "2" },
  { id: "C", value: "2\u03C0" },
  { id: "D", value: "4\u03C0" },
];

export default function HeroPracticeSection() {
  return (
    <section id="platforma" style={{ background: bg, padding: "72px 24px" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "0.78fr 1.22fr",
          gap: 56,
          alignItems: "center",
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
            Mashq tizimi
          </p>
          <h2
            style={{
              fontSize: 50,
              lineHeight: 1.06,
              fontWeight: 800,
              color: textPrimary,
              margin: "0 0 20px",
              letterSpacing: "-0.02em",
            }}
          >
            Yeching.
            <br />
            Tushuning.
            <br />
            Rivojlaning.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: textSecondary,
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Test natijalaringizni chuqur tahlil qiling va siz uchun tavsiya
            etilgan mashqlar bilan bilimlaringizni mustahkamlang.
          </p>

          <div style={{ borderTop: `1px solid ${cardBorder}` }}>
            {[
              {
                title: "Real imtihon formatidagi testlar",
                desc: "DTM va Milliy Sertifikat formatidagi vaqtli sinovlar orqali o'zingizni haqiqiy imtihonga tayyorlang.",
              },
              {
                title: "Mavzular bo'yicha tahlil",
                desc: "Qaysi mavzularda kuchli ekaningizni va qayerda ko'proq ishlash kerakligini bir qarashda ko'ring.",
              },
              {
                title: "Siz uchun tavsiya etilgan mashqlar",
                desc: "Har bir test natijasiga qarab keyingi mashqlar avtomatik tavsiya qilinadi.",
              },
            ].map((row) => (
              <div
                key={row.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.4fr",
                  gap: 16,
                  padding: "20px 0",
                  borderBottom: `1px solid ${cardBorder}`,
                }}
              >
                <p style={{ fontWeight: 700, color: textPrimary, margin: 0 }}>
                  {row.title}
                </p>
                <p style={{ color: textSecondary, margin: 0, fontSize: 15 }}>
                  {row.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${cardBorder}`,
            borderRadius: 20,
            boxShadow: "0 30px 70px -26px rgba(164, 116, 24, 0.32)",
            overflow: "hidden",
          }}
        >
          {/* top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 28px",
              borderBottom: `1px solid ${cardBorder}`,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: textSecondary,
                margin: 0,
              }}
            >
              Fizika &middot; Savol 28/30
            </p>
            <span
              style={{
                background: "#F3E2BA",
                color: accentDark,
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              2.1 ball
            </span>
          </div>

          {/* savol qismi */}
          <div style={{ padding: "30px 28px 24px" }}>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: textPrimary,
                margin: "0 0 26px",
              }}
            >
              Garmonik tebranayotgan jismning tebranish davri 0,5 s ga teng.
              Uning siklik chastotasini (rad/s) aniqlang.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {options.map((opt) => (
                <div
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border: `1px solid ${cardBorder}`,
                    background: "#FDF8EF",
                    borderRadius: 12,
                    padding: "14px 18px",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#F3E2BA",
                      color: accentDark,
                      fontWeight: 700,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {opt.id}
                  </span>
                  <span style={{ fontSize: 16, color: textPrimary }}>
                    {opt.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              borderTop: `1px solid ${cardBorder}`,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `1px solid ${cardBorder}`,
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: textPrimary,
              }}
            >
              &larr; Oldingi
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: accent,
                color: "#fff",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Keyingi &rarr;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
