import type { GeneratedQuestion, QuestionType } from '@/types';
import type { GenerationInput } from './types';

const difficulties = ['easy', 'medium', 'hard'] as const;

function topic(input: GenerationInput): string {
  return input.subject?.trim() || input.title.trim() || 'the topic';
}

function sourceExcerpt(input: GenerationInput, index: number): string | null {
  if (!input.sourceText?.trim()) return null;
  const text = input.sourceText.trim();
  const len = 140;
  const start = Math.min((index * len) % Math.max(1, text.length), Math.max(0, text.length - len));
  return text.slice(start, start + len).trim();
}

export function buildQuestionForType(
  type: QuestionType,
  input: GenerationInput,
  index: number,
  number: number,
  marks: number,
  label: string
): GeneratedQuestion {
  const t = topic(input);
  const excerpt = sourceExcerpt(input, index);
  const difficulty = difficulties[index % 3];
  const id = `q-${label}-${index + 1}`;
  const hint = input.additionalInstructions
    ? ` (${input.additionalInstructions.slice(0, 80)})`
    : '';
  const contextQ = excerpt
    ? buildSourceQuestion(type, excerpt, t, index)
    : null;

  switch (type) {
    case 'multiple_choice':
      return {
        id,
        number,
        difficulty,
        marks,
        type,
        text:
          contextQ ||
          `Which statement about ${t} is correct?${hint}`,
        options: [
          `A key principle of ${t} applied in practice`,
          `A common misconception about ${t}`,
          `An unrelated fact not linked to ${t}`,
          `A vague statement that does not define ${t}`,
        ],
      };
    case 'short_answer':
      return {
        id,
        number,
        difficulty,
        marks,
        type,
        text:
          contextQ ||
          `Define or explain one important idea related to ${t}. Give a concise answer.${hint}`,
      };
    case 'long_answer':
      return {
        id,
        number,
        difficulty,
        marks,
        type,
        text:
          contextQ ||
          `Explain ${t} in detail. Include an example where relevant.${hint}`,
      };
    case 'fill_blank':
      return {
        id,
        number,
        difficulty,
        marks,
        type,
        text:
          contextQ ||
          `Complete: _____ (related to ${t}).${hint}`,
      };
    case 'true_false':
      return {
        id,
        number,
        difficulty,
        marks,
        type,
        text:
          contextQ ||
          `True or False: Core concepts of ${t} can be understood without definitions.${hint}`,
      };
    default:
      return {
        id,
        number,
        difficulty,
        marks,
        type: 'short_answer',
        text: contextQ || `Write a short answer about ${t}.${hint}`,
      };
  }
}

function buildSourceQuestion(
  type: QuestionType,
  excerpt: string,
  topic: string,
  index: number
): string {
  const snippet = excerpt.replace(/\s+/g, ' ').trim();
  const who = snippet.match(
    /(?:Alice|White Rabbit|Rabbit-Hole|Wonderland|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g
  );
  const name = who?.[index % (who?.length || 1)] || topic;

  switch (type) {
    case 'multiple_choice':
      return `According to the uploaded page, which detail about ${name} is correct?`;
    case 'true_false':
      return `True or False: ${snippet.slice(0, 120)}?`;
    case 'fill_blank':
      return `Fill in the blank based on the page: ${snippet.slice(0, 80)} _____`;
    case 'long_answer':
      return `Explain what happens in this part of the text regarding ${name}.`;
    default:
      return `What does the uploaded page say about ${name}?`;
  }
}
