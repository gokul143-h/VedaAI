'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { removeLocalAssignment } from '@/lib/assignmentStorage';
import type { AssignmentListItem } from '@/types';

interface AssignmentCardProps {
  assignment: AssignmentListItem;
}

function formatCardDate(dateStr: string) {
  return format(new Date(dateStr), 'dd-MM-yyyy');
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const paperHref = `/paper/${assignment.id}`;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeLocalAssignment(assignment.id);
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('assignments-updated'));
  }

  return (
    <article className="group relative flex min-h-[152px] flex-col rounded-[20px] border border-zinc-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:border-zinc-200/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
      <Link
        href={paperHref}
        className="absolute inset-0 z-0 rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        aria-label={`View questions for ${assignment.title}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
        <h3 className="min-w-0 flex-1 pr-2 text-[17px] font-bold leading-snug tracking-tight text-ink group-hover:text-zinc-700">
          {assignment.title}
        </h3>

        <div
          ref={menuRef}
          className="relative shrink-0 pointer-events-auto"
          onClick={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Assignment options"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 min-w-[168px] overflow-hidden rounded-xl border border-zinc-100 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              role="menu"
            >
              <Link
                href={paperHref}
                role="menuitem"
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-ink transition hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink className="h-4 w-4 text-zinc-400" />
                View questions
              </Link>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-10 text-[13px] pointer-events-none">
        <span>
          <span className="font-semibold text-ink">Assigned on :</span>{' '}
          <span className="font-normal text-zinc-500">
            {formatCardDate(assignment.createdAt)}
          </span>
        </span>
        <span>
          <span className="font-semibold text-ink">Due :</span>{' '}
          <span className="font-normal text-zinc-500">
            {formatCardDate(assignment.dueDate)}
          </span>
        </span>
      </div>
    </article>
  );
}
