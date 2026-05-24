import type { Difficulty } from '@/types';

const STYLES: Record<Difficulty, string> = {
  easy: 'text-emerald-700',
  medium: 'text-amber-700',
  hard: 'text-rose-700',
};

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Moderate',
  hard: 'Challenging',
};

export function getDifficultyLabel(difficulty: Difficulty): string {
  return LABELS[difficulty];
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`font-semibold ${STYLES[difficulty]}`}
    >
      [{LABELS[difficulty]}]
    </span>
  );
}
