'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  Users,
  FileText,
  Sparkles,
  Library,
  Settings,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { getLocalAssignmentCount } from '@/lib/assignmentStorage';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText, badge: true },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: '/library', label: 'My Library', icon: Library },
];

interface SidebarProps {
  variant?: 'default' | 'output';
}

export function Sidebar({ variant = 'default' }: SidebarProps) {
  const pathname = usePathname();
  const isOutput = variant === 'output';
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    function refresh() {
      setBadgeCount(getLocalAssignmentCount());
    }
    refresh();
    function onUpdate(e: Event) {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      if (detail?.count != null) setBadgeCount(detail.count);
      else refresh();
    }
    window.addEventListener('assignments-updated', onUpdate);
    return () => window.removeEventListener('assignments-updated', onUpdate);
  }, []);

  return (
    <aside className="hidden w-[252px] shrink-0 p-4 pl-5 lg:block">
      <div className="flex h-[calc(100vh-2rem)] flex-col rounded-[22px] border border-zinc-200/70 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-6 px-4 pt-6">
          <Logo />

          {isOutput ? (
            <Link
              href="/toolkit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.15),0_0_0_1px_rgba(249,115,22,0.45),0_0_20px_rgba(249,115,22,0.12)] transition hover:bg-zinc-900"
            >
              <Sparkles className="h-4 w-4 text-brand-400" strokeWidth={2} />
              AI Teacher&apos;s Toolkit
            </Link>
          ) : (
            <Link
              href="/create"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(0,0,0,0.15),0_0_0_1px_rgba(249,115,22,0.45),0_0_20px_rgba(249,115,22,0.12)] transition hover:bg-zinc-900"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create Assignment
            </Link>
          )}

          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
              const active =
                href === '/assignments'
                  ? pathname.startsWith('/assignments') ||
                    pathname.startsWith('/paper')
                  : pathname === href;
              const showBadge = badge && badgeCount > 0;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 py-2.5 pl-3 pr-2 text-[13px] font-medium transition ${
                    active
                      ? 'rounded-xl bg-zinc-100 text-ink'
                      : 'rounded-xl text-ink-muted hover:bg-zinc-50 hover:text-ink'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-lg bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-ink-muted transition hover:bg-zinc-50 hover:text-ink"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
