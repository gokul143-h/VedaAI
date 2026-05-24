'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';

export function HeaderActions() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="flex h-9 items-center gap-2 sm:gap-4" suppressHydrationWarning>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-zinc-50"
          aria-label="Notifications"
          suppressHydrationWarning
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 transition hover:border-zinc-100 hover:bg-zinc-50 sm:flex"
          suppressHydrationWarning
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-xs font-bold text-orange-900 shadow-sm">
            JD
          </div>
          <span className="text-sm font-medium text-ink">John Doe</span>
          <ChevronDown className="h-4 w-4 text-ink-muted" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-xs font-bold text-orange-900 shadow-sm sm:hidden">
          JD
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label="Menu"
          suppressHydrationWarning
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 top-14 z-20 bg-black/20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="border-b border-zinc-200 bg-white px-4 py-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/groups', label: 'My Groups' },
                { href: '/assignments', label: 'Assignments' },
                { href: '/toolkit', label: "AI Teacher's Toolkit" },
                { href: '/library', label: 'My Library' },
                { href: '/settings', label: 'Settings' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-zinc-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function HeaderActionsPlaceholder() {
  return (
    <span className="inline-block h-9 w-[7.5rem] sm:w-[12rem]" aria-hidden />
  );
}
