'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Library, Sparkles } from 'lucide-react';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/toolkit', label: 'AI Toolkit', icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl bg-ink px-2 py-2.5 shadow-lg">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/assignments'
              ? pathname.startsWith('/assignments')
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[10px] font-medium transition ${
                active ? 'text-white' : 'text-zinc-400'
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.25 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
