import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export function Header({ showBack, backHref = '/' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backHref}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900">VedaAI</span>
          </Link>
        </div>
        <Link href="/create" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          New Assessment
        </Link>
      </div>
    </header>
  );
}
