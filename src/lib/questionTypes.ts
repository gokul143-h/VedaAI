import type { QuestionType, QuestionTypeConfig } from '@/types';

export interface QuestionTypeDefinition {
  value: QuestionType;
  formLabel: string;
  sectionTitle: string;
  sectionInstruction: (marks: number) => string;
  aiRules: string;
}

export const QUESTION_TYPE_CATALOG: Record<QuestionType, QuestionTypeDefinition> = {
  multiple_choice: {
    value: 'multiple_choice',
    formLabel: 'Multiple Choice Questions',
    sectionTitle: 'Multiple Choice Questions',
    sectionInstruction: (m) =>
      `Choose the correct option. Each question carries ${m} mark${m !== 1 ? 's' : ''}.`,
    aiRules:
      'Write a clear stem. Provide exactly 4 distinct options as strings (not labelled A–D in the text). Only one correct answer. Set type to "multiple_choice".',
  },
  short_answer: {
    value: 'short_answer',
    formLabel: 'Short Questions',
    sectionTitle: 'Short Answer Questions',
    sectionInstruction: (m) =>
      `Answer in 2–4 sentences. Each question carries ${m} mark${m !== 1 ? 's' : ''}.`,
    aiRules:
      'Ask for a brief, factual answer (2–4 sentences). No options array. Set type to "short_answer".',
  },
  long_answer: {
    value: 'long_answer',
    formLabel: 'Diagram / Graph-Based Questions',
    sectionTitle: 'Long Answer Questions',
    sectionInstruction: (m) =>
      `Answer with explanation; include a diagram or graph where asked. Each question carries ${m} mark${m !== 1 ? 's' : ''}.`,
    aiRules:
      'Require detailed explanation; mention diagram/graph/sketch where appropriate. No options array. Set type to "long_answer".',
  },
  fill_blank: {
    value: 'fill_blank',
    formLabel: 'Numerical Problems',
    sectionTitle: 'Numerical / Fill in the Blanks',
    sectionInstruction: (m) =>
      `Show working for numericals. Each question carries ${m} mark${m !== 1 ? 's' : ''}.`,
    aiRules:
      'Use _____ for blanks or give a numerical problem with given data. No options array. Set type to "fill_blank".',
  },
  true_false: {
    value: 'true_false',
    formLabel: 'True / False',
    sectionTitle: 'True or False',
    sectionInstruction: (m) =>
      `Write True or False. Each question carries ${m} mark${m !== 1 ? 's' : ''}.`,
    aiRules:
      'State one declarative sentence that is clearly true or false. No options array. Set type to "true_false".',
  },
};

export const QUESTION_TYPE_OPTIONS = Object.values(QUESTION_TYPE_CATALOG).map(
  ({ value, formLabel }) => ({ value, label: formLabel })
);

/** Default rows shown on the create-assignment form */
export const DEFAULT_QUESTION_TYPE_ROWS: QuestionTypeConfig[] = [
  { type: 'multiple_choice', count: 4, marksPerQuestion: 1 },
  { type: 'short_answer', count: 3, marksPerQuestion: 2 },
  { type: 'long_answer', count: 5, marksPerQuestion: 5 },
  { type: 'fill_blank', count: 5, marksPerQuestion: 5 },
];

const LEGACY_QUESTION_TYPE_ALIASES: Record<string, QuestionType> = {
  mcq: 'multiple_choice',
  short: 'short_answer',
  short_questions: 'short_answer',
  long: 'long_answer',
  long_questions: 'long_answer',
  diagram_based: 'long_answer',
  numerical: 'fill_blank',
  fill_in_the_blank: 'fill_blank',
  fill_in_the_blanks: 'fill_blank',
  true_or_false: 'true_false',
};

function normalizeQuestionType(type: string): QuestionType {
  const cleaned = type.trim().toLowerCase();
  if (cleaned in QUESTION_TYPE_CATALOG) {
    return cleaned as QuestionType;
  }
  if (cleaned in LEGACY_QUESTION_TYPE_ALIASES) {
    return LEGACY_QUESTION_TYPE_ALIASES[cleaned];
  }
  throw new Error(
    `Unsupported question type "${type}". Use one of: ${Object.keys(QUESTION_TYPE_CATALOG).join(', ')}`
  );
}

export function getQuestionTypeDefinition(type: string): QuestionTypeDefinition {
  return QUESTION_TYPE_CATALOG[normalizeQuestionType(type)];
}
