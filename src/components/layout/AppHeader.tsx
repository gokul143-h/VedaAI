'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { Logo } from './Logo';
import { HeaderActionsPlaceholder } from './HeaderActions';

const HeaderActions = dynamic(
  () => import('./HeaderActions').then((m) => m.HeaderActions),
  { ssr: false, loading: () => <HeaderActionsPlaceholder /> }
);

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function AppHeader({
  title = 'Assignment',
  showBack = true,
  backHref = '/',
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-zinc-100/80 bg-white/95 px-5 backdrop-blur-sm sm:px-8 lg:h-[60px]">
      <div className="flex items-center gap-3 lg:hidden">
        <Logo compact />
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        {showBack && (
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-ink-muted transition hover:bg-zinc-50 hover:text-ink"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <LayoutGrid className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
        <h1 className="text-[15px] font-medium text-ink">{title}</h1>
      </div>

      <h1
        className={`text-[15px] font-medium text-ink lg:hidden ${
          !showBack && title === 'Assignment' ? 'sr-only' : ''
        }`}
      >
        {title}
      </h1>

      <HeaderActions />
    </header>
  );
}
