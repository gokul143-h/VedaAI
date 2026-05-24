'use client';

import { ChevronDown, X } from 'lucide-react';
import type { QuestionType, QuestionTypeConfig } from '@/types';
import { QUESTION_TYPE_OPTIONS } from '@/lib/questionTypes';
import { StepperInput } from './StepperInput';

/** Shared grid with column headers in AssignmentForm */
export const QUESTION_TYPE_ROW_GRID =
  'grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_2.25rem] sm:gap-4';

interface QuestionTypeRowProps {
  config: QuestionTypeConfig;
  index: number;
  canRemove: boolean;
  errors?: Record<string, string | undefined>;
  onUpdate: (
    index: number,
    field: keyof QuestionTypeConfig,
    value: QuestionType | number
  ) => void;
  onRemove: (index: number) => void;
}

export function QuestionTypeRow({
  config,
  index,
  canRemove,
  errors,
  onUpdate,
  onRemove,
}: QuestionTypeRowProps) {
  return (
    <div className={`${QUESTION_TYPE_ROW_GRID} border-b border-zinc-100 py-4 last:border-b-0`}>
      <div className="relative min-w-0">
        <select
          value={config.type}
          onChange={(e) =>
            onUpdate(index, 'type', e.target.value as QuestionType)
          }
          className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white py-0 pl-4 pr-10 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-200/80"
        >
          {QUESTION_TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          strokeWidth={2}
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-center">
        <span className="text-xs font-medium text-ink-muted sm:hidden">
          No. of Questions
        </span>
        <StepperInput
          value={config.count}
          onChange={(v) => onUpdate(index, 'count', v)}
        />
      </div>
      {errors?.[`questionTypes.${index}.count`] && (
        <p className="col-span-full -mt-2 text-[10px] text-red-600 sm:hidden">
          {errors[`questionTypes.${index}.count`]}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 sm:justify-center">
        <span className="text-xs font-medium text-ink-muted sm:hidden">
          Marks
        </span>
        <StepperInput
          value={config.marksPerQuestion}
          onChange={(v) => onUpdate(index, 'marksPerQuestion', v)}
          min={1}
        />
      </div>
      {errors?.[`questionTypes.${index}.marks`] && (
        <p className="col-span-full -mt-2 text-[10px] text-red-600 sm:hidden">
          {errors[`questionTypes.${index}.marks`]}
        </p>
      )}

      <div className="flex justify-end sm:justify-center">
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex h-9 w-9 items-center justify-center text-zinc-400 transition hover:text-zinc-600"
            aria-label="Remove question type"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : (
          <span className="inline-block h-9 w-9" aria-hidden />
        )}
      </div>
    </div>
  );
}
