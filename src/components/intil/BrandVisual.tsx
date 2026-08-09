/**
 * Abstract INTIL brand visual — concentric girih-derived geometry drawn with
 * thin champagne lines. No imagery, no orbiting planets, no icons.
 */
export function BrandVisual({ className }: { className?: string }) {
  const rings = [
    { r: 148, o: 0.1, w: 1 },
    { r: 118, o: 0.16, w: 1 },
    { r: 84, o: 0.28, w: 1 },
  ];
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="intil-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--champagne)" />
          <stop offset="55%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="var(--gold-muted)" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="intil-core" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--champagne)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--champagne)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="160" cy="160" r="120" fill="url(#intil-core)" />

      {rings.map((ring) => (
        <circle
          key={ring.r}
          cx="160"
          cy="160"
          r={ring.r}
          stroke="var(--gold)"
          strokeOpacity={ring.o}
          strokeWidth={ring.w}
        />
      ))}

      {[0, 22.5, 45, 67.5].map((a) => (
        <rect
          key={a}
          x="76"
          y="76"
          width="168"
          height="168"
          stroke="url(#intil-line)"
          strokeWidth="1"
          strokeOpacity={a === 0 ? 0.9 : 0.42}
          transform={`rotate(${a} 160 160)`}
        />
      ))}

      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1="160"
          y1="12"
          x2="160"
          y2="308"
          stroke="var(--gold)"
          strokeOpacity="0.12"
          transform={`rotate(${a} 160 160)`}
        />
      ))}

      <circle cx="160" cy="160" r="5" fill="var(--gold)" />
      <circle cx="160" cy="160" r="26" stroke="var(--gold)" strokeOpacity="0.5" />
    </svg>
  );
}

export default BrandVisual;
