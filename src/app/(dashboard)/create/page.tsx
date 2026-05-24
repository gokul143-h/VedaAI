'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { AssignmentForm } from '@/components/form/AssignmentForm';

export default function CreatePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="Assignment" showBack backHref="/assignments" />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <h1 className="text-[26px] font-bold tracking-tight text-ink sm:text-[28px]">
                Create Assignment
              </h1>
            </div>
            <p className="mt-1.5 text-[15px] text-ink-muted">
              Set up a new assignment for your students.
            </p>
          </div>

          <AssignmentForm />
        </div>
      </main>
    </div>
  );
}
