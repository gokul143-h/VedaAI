'use client';

import { ChevronDown, ListFilter, Search } from 'lucide-react';

interface AssignmentsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterLabel: string;
  onFilterClick: () => void;
}

export function AssignmentsToolbar({
  search,
  onSearchChange,
  filterLabel,
  onFilterClick,
}: AssignmentsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        onClick={onFilterClick}
        className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-zinc-200/80 bg-white/80 px-5 py-2.5 text-sm font-medium text-ink shadow-sm backdrop-blur-sm transition hover:border-zinc-300 hover:bg-white"
      >
        <ListFilter className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
        {filterLabel}
        <ChevronDown className="h-4 w-4 text-ink-muted" />
      </button>

      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Assignment"
          className="w-full rounded-full border border-zinc-200/80 bg-zinc-50/90 py-2.5 pl-11 pr-4 text-sm text-ink shadow-sm backdrop-blur-sm placeholder:text-zinc-400 transition focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200/60"
        />
      </div>
    </div>
  );
}
