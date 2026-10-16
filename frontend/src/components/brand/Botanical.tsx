/** Soft botanical SVG sprigs echoing mockup leaves, drawn in currentColor. */
export function LeafSprig({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 160" fill="none" aria-hidden="true" focusable="false" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M60 150 C60 105 58 65 52 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      <ellipse cx="70" cy="48" rx="17" ry="7" fill="currentColor" opacity="0.22" transform="rotate(-38 70 48)" />
      <ellipse cx="44" cy="72" rx="18" ry="7" fill="currentColor" opacity="0.14" transform="rotate(36 44 72)" />
      <ellipse cx="72" cy="96" rx="16" ry="6.5" fill="currentColor" opacity="0.22" transform="rotate(-34 72 96)" />
      <ellipse cx="46" cy="118" rx="15" ry="6" fill="currentColor" opacity="0.14" transform="rotate(32 46 118)" />
      <ellipse cx="52" cy="14" rx="7" ry="11" fill="currentColor" opacity="0.2" transform="rotate(-18 52 14)" />
    </svg>
  );
}

/** Small balanced-stones motif from the mockups. */
export function StoneStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" fill="none" aria-hidden="true" focusable="false" className={className}>
      <ellipse cx="32" cy="64" rx="20" ry="5" fill="currentColor" opacity="0.12" />
      <ellipse cx="32" cy="56" rx="17" ry="8" fill="currentColor" opacity="0.28" />
      <ellipse cx="32" cy="44" rx="13" ry="7" fill="currentColor" opacity="0.35" />
      <ellipse cx="32" cy="34" rx="9.5" ry="5.5" fill="currentColor" opacity="0.42" />
      <ellipse cx="32" cy="25" rx="6.5" ry="4.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
