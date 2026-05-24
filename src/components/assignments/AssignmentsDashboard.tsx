'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listLocalAssignments } from '@/lib/assignmentStorage';
import type { AssignmentListItem, JobStatus } from '@/types';
import { AssignmentsToolbar } from './AssignmentsToolbar';
import { AssignmentCard } from './AssignmentCard';
import { FloatingCreateBar } from './FloatingCreateBar';
import { AssignmentsEmptyState } from './AssignmentsEmptyState';

type StatusFilter = 'all' | JobStatus;

function notifyCount(count: number) {
  window.dispatchEvent(
    new CustomEvent('assignments-updated', { detail: { count } })
  );
}

export function AssignmentsDashboard() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const load = useCallback(() => {
    const items = listLocalAssignments();
    setAssignments(items);
    notifyCount(items.length);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener('assignments-updated', onUpdate);
    return () => window.removeEventListener('assignments-updated', onUpdate);
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...assignments];
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assignments, search, statusFilter]);

  function cycleFilter() {
    const order: StatusFilter[] = [
      'all',
      'completed',
      'processing',
      'queued',
      'failed',
    ];
    const idx = order.indexOf(statusFilter);
    setStatusFilter(order[(idx + 1) % order.length]);
  }

  const filterLabel =
    statusFilter === 'all' ? 'Filter By' : `Filter: ${statusFilter}`;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-ink" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return <AssignmentsEmptyState />;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-2 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <h2 className="text-[26px] font-bold tracking-tight text-ink sm:text-[28px]">
            Assignments
          </h2>
        </div>
        <p className="mt-1.5 text-[15px] text-zinc-500">
          Manage and create assignments for your classes.
        </p>
      </div>

      <div className="shrink-0 px-5 py-5 sm:px-8">
        <AssignmentsToolbar
          search={search}
          onSearchChange={setSearch}
          filterLabel={filterLabel}
          onFilterClick={cycleFilter}
        />
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-5 pb-28 pt-1 sm:px-8 sm:pb-36">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-zinc-500">
              No assignments match your search.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {filtered.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent"
          aria-hidden
        />
      </div>

      <FloatingCreateBar />
    </div>
  );
}
