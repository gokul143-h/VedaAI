import type { QuestionType } from '@/types';

/** Map frontend form types → backend API types */
const TO_BACKEND: Record<QuestionType, string> = {
  multiple_choice: 'mcq',
  short_answer: 'short_answer',
  long_answer: 'diagram_based',
  fill_blank: 'numerical',
  true_false: 'mcq',
};

export function mapQuestionTypesToBackend(
  rows: { type: QuestionType; count: number; marksPerQuestion: number }[]
) {
  return rows.map((r) => ({
    type: TO_BACKEND[r.type],
    count: r.count,
    marksPerQuestion: r.marksPerQuestion,
  }));
}
