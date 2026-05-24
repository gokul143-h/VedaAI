'use client';

import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileFab } from './MobileFab';

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarVariant?: 'default' | 'output';
  hideMobileFab?: boolean;
}

export function DashboardShell({
  children,
  sidebarVariant = 'default',
  hideMobileFab = false,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#ececee]">
      <Sidebar variant={sidebarVariant} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pr-4 pt-4 max-lg:pr-0 max-lg:pt-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-200/60 max-lg:rounded-none max-lg:shadow-none max-lg:ring-0">
          {children}
        </div>
      </div>
      {!hideMobileFab && <MobileFab />}
      <BottomNav />
    </div>
  );
}
