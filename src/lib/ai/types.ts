import type { QuestionTypeConfig } from '@/types';

export interface GenerationInput {
  title: string;
  subject?: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  sourceText?: string;
}
