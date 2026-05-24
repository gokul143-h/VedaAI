export function EmptyIllustration() {
  return (
    <div
      className="relative mx-auto flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-50 shadow-inner" />

      <svg
        viewBox="0 0 200 180"
        className="relative h-full w-full"
        fill="none"
      >
        {/* Floating paper — back */}
        <g transform="rotate(-8 42 52)">
          <rect
            x="22"
            y="38"
            width="52"
            height="68"
            rx="5"
            fill="white"
            stroke="#e4e4e7"
            strokeWidth="1.5"
            opacity="0.85"
          />
          <line x1="32" y1="52" x2="64" y2="52" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="62" x2="58" y2="62" stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Main document */}
        <rect
          x="58"
          y="32"
          width="76"
          height="100"
          rx="7"
          fill="white"
          stroke="#d4d4d8"
          strokeWidth="2"
          filter="url(#doc-shadow)"
        />
        <line x1="72" y1="54" x2="120" y2="54" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="66" x2="112" y2="66" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="78" x2="116" y2="78" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="90" x2="104" y2="90" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="102" x2="108" y2="102" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="round" />

        {/* Floating paper — front corner */}
        <g transform="rotate(6 148 118)">
          <rect
            x="128"
            y="100"
            width="40"
            height="52"
            rx="4"
            fill="white"
            stroke="#e4e4e7"
            strokeWidth="1.5"
            opacity="0.9"
          />
        </g>

        {/* Magnifying glass */}
        <circle cx="124" cy="78" r="30" fill="white" stroke="#d4d4d8" strokeWidth="3" />
        <circle cx="124" cy="78" r="22" fill="#fafafa" stroke="#e4e4e7" strokeWidth="1.5" />

        <path
          d="M114 68 L134 88 M134 68 L114 88"
          stroke="#ef4444"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="146"
          y1="100"
          x2="168"
          y2="122"
          stroke="#a1a1aa"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <circle cx="36" cy="44" r="3" fill="#e4e4e7" opacity="0.6" />
        <circle cx="172" cy="36" r="4" fill="#e4e4e7" opacity="0.5" />
        <circle cx="178" cy="128" r="3" fill="#e4e4e7" opacity="0.5" />

        <defs>
          <filter id="doc-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
