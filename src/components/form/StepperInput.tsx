'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function StepperInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: StepperInputProps) {
  function decrement() {
    onChange(Math.max(min, value - 1));
  }

  function increment() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div className="inline-flex h-10 items-center rounded-full border border-zinc-200 bg-white px-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      <span className="min-w-[1.75rem] select-none px-0.5 text-center text-sm font-semibold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
