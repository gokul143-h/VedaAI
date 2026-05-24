import type { GeneratedQuestion } from '@/types';
import { getDifficultyLabel } from './DifficultyBadge';

interface QuestionItemProps {
  question: GeneratedQuestion;
  variant?: 'exam' | 'simple';
}

export function QuestionItem({
  question,
  variant = 'exam',
}: QuestionItemProps) {
  if (variant === 'simple') {
    return (
      <li className="break-inside-avoid py-3 text-[15px] leading-relaxed text-paper-ink">
        <p>
          <span className="mr-1 font-semibold">{question.number}.</span>
          {question.text}
        </p>
        {question.options && question.options.length > 0 && (
          <ol className="ml-6 mt-2 list-[upper-alpha] space-y-1 pl-4 text-paper-muted">
            {question.options.map((opt, i) => (
              <li key={i}>{opt}</li>
            ))}
          </ol>
        )}
      </li>
    );
  }

  const difficultyLabel = getDifficultyLabel(question.difficulty);

  return (
    <li className="break-inside-avoid py-3.5 text-[14px] leading-relaxed text-paper-ink">
      <p>
        <span className="font-semibold">{question.number}. </span>
        <span className="font-semibold text-paper-muted">
          [{difficultyLabel}]
        </span>{' '}
        {question.text}{' '}
        <span className="font-semibold text-paper-muted">
          [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
        </span>
      </p>

      {question.type === 'true_false' && (
        <p className="ml-6 mt-2 text-sm text-paper-muted">
          Answer: True / False
        </p>
      )}

      {question.options && question.options.length > 0 && (
        <ol className="ml-6 mt-2 list-[upper-alpha] space-y-1 pl-4 text-paper-muted">
          {question.options.map((opt, i) => (
            <li key={i}>{opt}</li>
          ))}
        </ol>
      )}
    </li>
  );
}
