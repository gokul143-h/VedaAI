import Link from 'next/link';
import { Plus } from 'lucide-react';
import { EmptyIllustration } from './EmptyIllustration';

export function AssignmentsEmptyState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 pb-36 text-center sm:px-10 sm:py-14 lg:pb-14">
      <EmptyIllustration />

      <h2 className="mt-10 text-2xl font-bold tracking-tight text-ink sm:text-[26px]">
        No assignments yet
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Link
        href="/create"
        className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-brand-500/30 transition hover:bg-zinc-800 hover:shadow-[0_4px_14px_rgba(0,0,0,0.14)] active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Create Your First Assignment
      </Link>
    </div>
  );
}
