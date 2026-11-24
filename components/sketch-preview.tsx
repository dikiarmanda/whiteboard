export function SketchPreview() {
  return (
    <svg viewBox="0 0 420 280" className="h-full w-full" aria-hidden="true">
      <rect x="36" y="48" width="132" height="72" fill="none" stroke="#0e7a6b" strokeWidth="2.5" />
      <rect x="236" y="36" width="140" height="58" fill="none" stroke="#14262c" strokeWidth="2.25" />
      <rect x="220" y="156" width="156" height="72" fill="none" stroke="#14262c" strokeWidth="2.25" />
      <path d="M168 84 H214" fill="none" stroke="#e09a1b" strokeWidth="2.5" />
      <path d="M206 74 L222 84 L206 94" fill="none" stroke="#e09a1b" strokeWidth="2.5" />
      <path d="M306 94 V146" fill="none" stroke="#0e7a6b" strokeWidth="2.25" />
      <path d="M298 138 L306 154 L314 138" fill="none" stroke="#0e7a6b" strokeWidth="2.25" />
      <text x="58" y="90" fill="#14262c" fontFamily="var(--font-display), sans-serif" fontSize="20">
        ide
      </text>
      <text x="258" y="72" fill="#14262c" fontFamily="var(--font-display), sans-serif" fontSize="18">
        alur
      </text>
      <text x="246" y="198" fill="#14262c" fontFamily="var(--font-display), sans-serif" fontSize="18">
        catatan
      </text>
    </svg>
  );
}
