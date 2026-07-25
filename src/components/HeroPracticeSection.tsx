import React from "react";

// INTIL — amaliy mashq bo'limi, DTM matematik savoli bilan
// Karta reference (IELTStation) bilan bir xil nisbatda — katta, professional taqdimot

const accent = "#C9962E";
const accentDark = "#A47418";
const bg = "#FBF3E7";
const cardBorder = "#EADDC5";
const textPrimary = "#221C13";
const textSecondary = "#6B6152";

function Fraction({ num, den }: { num: string; den: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        verticalAlign: "middle",
        margin: "0 3px",
        lineHeight: 1.1,
      }}
    >
      <span style={{ fontSize: "0.95em" }}>{num}</span>
      <span
        style={{
          width: "100%",
          borderTop: `1.4px solid ${textPrimary}`,
          margin: "1px 0",
        }}
      />
      <span style={{ fontSize: "0.95em" }}>{den}</span>
    </span>
  );
}

function TriangleSquareDiagram() {
  return (
    <svg
      viewBox="0 0 260 220"
      width="230"
      height="195"
      style={{ display: "block" }}
    >
      <rect
        x="30"
        y="66"
        width="150"
        height="150"
        fill="none"
        stroke="#332B1C"
        strokeWidth="2.5"
      />
      <polygon
        points="150,14 238,188 62,188"
        fill="none"
        stroke="#332B1C"
        strokeWidth="2.5"
      />
      <polygon
        points="150,66 180,138 78,138 95,66"
        fill="#E7C787"
        opacity="0.75"
      />
    </svg>
  );
}

const options = [
  { id: "A", value: "2\u221C3" },
  { id: "B", value: "2\u221A3", selected: true },
  { id: "C", value: "\u221A(2\u221A3)" },
  { id: "D", value: "\u221A3" },
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: `1px solid ${cardBorder}`,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#EADDC5",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: textSecondary,
                margin: 0,
              }}
            >
              DTM &middot; Matematika &middot; 13-savol
            </p>
            <span
              style={{
                background: accentDark,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              24:08
            </span>
          </div>

          <div style={{ padding: "32px 32px 20px", display: "flex", gap: 28 }}>
            <div style={{ flexShrink: 0 }}>
              <TriangleSquareDiagram />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: accentDark,
                  margin: "0 0 10px",
                }}
              >
                13-savol
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: textPrimary,
                  margin: "0 0 22px",
                }}
              >
                Rasmda muntazam uchburchak va kvadrat tasvirlangan. Agar ular
                kesishgan (rasmda bo'yab ko'rsatilgan) sohaning yuzi
                uchburchak yuzining <Fraction num="1" den="6" /> qismiga,
                kvadrat yuzining esa <Fraction num="1" den="4" /> qismiga
                teng bo'lsa, uchburchak tomonining kvadrat tomoniga
                nisbatini toping.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: `1.5px solid ${opt.selected ? accent : cardBorder}`,
                      background: opt.selected ? "#FBF0DA" : "#FFFFFF",
                      borderRadius: 10,
                      padding: "13px 16px",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `1.5px solid ${opt.selected ? accent : "#DCCBA0"}`,
                        background: opt.selected ? accent : "transparent",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 15, color: textPrimary }}>
                      {opt.id}. {opt.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 32px",
              borderTop: `1px solid ${cardBorder}`,
            }}
          >
            <span style={{ fontSize: 13, color: accentDark, fontWeight: 600 }}>
              13 / 30
            </span>
            <span style={{ fontSize: 13, color: textSecondary }}>
              Avtomatik saqlangan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
