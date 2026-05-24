import Link from 'next/link';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact, className = '' }: LogoProps) {
  return (
    <Link href="/assignments" className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden>
          <defs>
            <linearGradient id="veda-v" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <path
            d="M8 6 L18 30 L22 30 L32 6 L26 6 L20 22 L14 6 Z"
            fill="url(#veda-v)"
          />
        </svg>
      </div>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-ink">VedaAI</span>
      )}
    </Link>
  );
}
