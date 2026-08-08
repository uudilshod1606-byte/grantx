/** Formula reference shown inside the Bluebook-style exam (Matematika only). */
export type RefGroup = { title: string; items: { label?: string; latex: string }[] };

export const MATH_REFERENCE: RefGroup[] = [
  {
    title: "Tenglamalar",
    items: [
      { latex: "ax^2+bx+c=0;\\ x_{1,2}=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" },
      { latex: "x_1+x_2=-\\frac{b}{a};\\ x_1\\cdot x_2=\\frac{c}{a}" },
    ],
  },
  {
    title: "Qisqa ko'paytirish formulalari",
    items: [
      { latex: "a^2-b^2=(a-b)(a+b)" },
      { latex: "(a\\pm b)^2=a^2\\pm 2ab+b^2" },
      { latex: "(a\\pm b)^3=a^3\\pm 3a^2b+3ab^2\\pm b^3" },
      { latex: "a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)" },
    ],
  },
  {
    title: "Arifmetik progressiya",
    items: [
      { latex: "a_n=a_1+(n-1)d" },
      { latex: "S_n=\\frac{a_1+a_n}{2}\\cdot n" },
    ],
  },
  {
    title: "Geometrik progressiya",
    items: [
      { latex: "b_n=b_1q^{n-1}" },
      { latex: "S_n=\\frac{b_1(1-q^n)}{1-q},\\ |q|>1;\\quad S=\\frac{b_1}{1-q},\\ |q|<1" },
    ],
  },
  {
    title: "Logarifm xossalari",
    items: [
      { latex: "\\log_a(x_1x_2)=\\log_a|x_1|+\\log_a|x_2|" },
      { latex: "\\log_a\\frac{x_1}{x_2}=\\log_a|x_1|-\\log_a|x_2|" },
      { latex: "\\log_a b=\\frac{\\log_c b}{\\log_c a};\\ \\log_a b=\\frac{1}{\\log_b a}" },
    ],
  },
  {
    title: "Daraja va ildiz",
    items: [
      { latex: "a^m\\cdot a^n=a^{m+n};\\ a^m:a^n=a^{m-n};\\ (a^m)^n=a^{mn}" },
      { latex: "\\sqrt[n]{a}\\cdot\\sqrt[n]{b}=\\sqrt[n]{ab};\\ \\left(\\sqrt[n]{a^m}\\right)^k=\\sqrt[n]{a^{mk}}" },
    ],
  },
  {
    title: "Urinma tenglamasi",
    items: [{ latex: "y=f(x_0)+f'(x_0)(x-x_0)" }],
  },
  {
    title: "Hosilalar",
    items: [
      { latex: "(x^a)'=ax^{a-1};\\ (e^x)'=e^x;\\ (\\ln x)'=\\frac{1}{x}" },
      { latex: "(\\sin x)'=\\cos x;\\ (\\cos x)'=-\\sin x" },
      { latex: "(u\\cdot v)'=u'v+uv';\\ \\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}" },
    ],
  },
  {
    title: "Integrallar",
    items: [
      { latex: "\\int x^m dx=\\frac{x^{m+1}}{m+1}+C" },
      { latex: "\\int \\frac{dx}{x}=\\ln|x|+C" },
      { latex: "\\int e^x dx=e^x+C" },
      { latex: "\\int \\sin x\\,dx=-\\cos x+C;\\ \\int\\cos x\\,dx=\\sin x+C" },
      { latex: "\\int_a^b f(x)dx=F(b)-F(a)" },
    ],
  },
  {
    title: "O'rta arifmetik va geometrik",
    items: [
      { latex: "A=\\frac{a_1+a_2+\\dots+a_n}{n}" },
      { latex: "G=\\sqrt[n]{a_1\\cdot a_2\\cdot\\ldots\\cdot a_n}" },
    ],
  },
  {
    title: "Trigonometriya",
    items: [
      { latex: "\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta" },
      { latex: "\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta" },
      { latex: "\\sin^2\\alpha+\\cos^2\\alpha=1;\\ \\mathrm{tg}\\,\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}" },
    ],
  },
  {
    title: "Uchburchak formulalari",
    items: [
      { latex: "S=\\frac{1}{2}ab\\sin\\gamma" },
      { latex: "S=\\sqrt{p(p-a)(p-b)(p-c)},\\ p=\\frac{1}{2}(a+b+c)" },
      { latex: "\\frac{\\sin\\alpha}{a}=\\frac{\\sin\\beta}{b}=\\frac{\\sin\\gamma}{c}" },
      { latex: "a^2=b^2+c^2-2bc\\cos\\alpha" },
      { label: "To'g'ri burchakli", latex: "a^2+b^2=c^2;\\ a=c\\sin\\alpha;\\ b=c\\cos\\alpha" },
      { latex: "r=\\frac{2S}{a+b+c};\\ R=\\frac{abc}{4S}" },
    ],
  },
  {
    title: "To'rtburchaklar yuzi",
    items: [
      { label: "Parallelogramm", latex: "S=ab\\sin\\alpha" },
      { label: "Romb", latex: "S=\\frac{1}{2}d_1d_2" },
      { label: "Trapetsiya", latex: "S=\\frac{a+b}{2}h" },
    ],
  },
  {
    title: "Vektorlar",
    items: [
      { latex: "|\\vec a|=\\sqrt{x^2+y^2+z^2}" },
      { latex: "\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\varphi=x_1x_2+y_1y_2" },
    ],
  },
  {
    title: "Aylana va doira",
    items: [
      { latex: "l=2\\pi R;\\ S=\\pi R^2" },
      { latex: "S_{sektor}=\\frac{\\pi R^2}{360}\\alpha;\\ S_{segment}=\\frac{R^2}{2}(\\alpha-\\sin\\alpha)" },
    ],
  },
  {
    title: "Stereometriya",
    items: [
      { label: "Prizma / Piramida", latex: "V=SH;\\quad V=\\frac{1}{3}SH" },
      { label: "Kesik piramida", latex: "V=\\frac{1}{3}h(S_1+\\sqrt{S_1S_2}+S_2)" },
      { label: "Silindr", latex: "V=\\pi R^2H,\\ S_{yon}=2\\pi RH" },
      { label: "Konus", latex: "V=\\frac{1}{3}\\pi R^2H,\\ S_{yon}=\\pi Rl" },
      { label: "Kesik konus", latex: "V=\\frac{1}{3}\\pi h(R_1^2+R_1R_2+R_2^2)" },
      { label: "Shar", latex: "V=\\frac{4}{3}\\pi R^3,\\ S=4\\pi R^2" },
    ],
  },
];

export const TRIG_TABLE = {
  head: ["\\alpha", "0", "\\frac{\\pi}{6}", "\\frac{\\pi}{4}", "\\frac{\\pi}{3}", "\\frac{\\pi}{2}"],
  sin: ["\\sin\\alpha", "0", "\\frac{1}{2}", "\\frac{\\sqrt2}{2}", "\\frac{\\sqrt3}{2}", "1"],
  cos: ["\\cos\\alpha", "1", "\\frac{\\sqrt3}{2}", "\\frac{\\sqrt2}{2}", "\\frac{1}{2}", "0"],
};