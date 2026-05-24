'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

export function MobileFab() {
  const pathname = usePathname();

  if (pathname === '/create' || pathname.startsWith('/paper')) return null;

  return (
    <Link
      href="/create"
      className="fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-fab ring-1 ring-zinc-200/80 transition hover:scale-105 active:scale-95 lg:hidden"
      aria-label="Create assignment"
    >
      <Plus className="h-6 w-6 text-brand-500" strokeWidth={2.5} />
    </Link>
  );
}
