import Link from 'next/link';
import { Plus } from 'lucide-react';

export function FloatingCreateBar() {
  return (
    <div className="pointer-events-none absolute bottom-7 left-0 right-0 z-20 hidden justify-center px-4 lg:flex">
      <Link
        href="/create"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-zinc-900 active:scale-[0.98] max-lg:shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Create Assignment
      </Link>
    </div>
  );
}
