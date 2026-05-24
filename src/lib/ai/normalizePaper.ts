import type { GeneratedPaper, GeneratedQuestion, QuestionType } from '@/types';
import { getQuestionTypeDefinition } from '@/lib/questionTypes';
import { buildQuestionForType } from './questionBuilders';
import type { GenerationInput } from './types';

const VALID_TYPES: QuestionType[] = [
  'multiple_choice',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_blank',
];

function isValidType(t: string): t is QuestionType {
  return VALID_TYPES.includes(t as QuestionType);
}

function normalizeQuestionShape(
  q: Partial<GeneratedQuestion>,
  type: QuestionType,
  marks: number,
  number: number,
  label: string,
  index: number
): GeneratedQuestion {
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const difficulty =
    q.difficulty && difficulties.includes(q.difficulty as (typeof difficulties)[number])
      ? q.difficulty
      : difficulties[index % 3];

  const base: GeneratedQuestion = {
    id: q.id || `q-${label}-${index + 1}`,
    number,
    text: (q.text || '').trim() || 'Question text unavailable.',
    difficulty,
    marks,
    type,
  };

  if (type === 'multiple_choice') {
    const opts = q.options?.filter(Boolean);
    if (opts && opts.length >= 4) {
      return { ...base, options: opts.slice(0, 4) };
    }
    return {
      ...base,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
    };
  }

  return base;
}

/**
 * Rebuilds the paper so sections match the form's questionTypes exactly
 * (one section per row, correct count, type, and marks).
 */
export function normalizePaperToQuestionTypes(
  parsed: GeneratedPaper,
  input: GenerationInput,
  fromSource = false
): GeneratedPaper {
  const pool = parsed.sections.flatMap((s) => s.questions);
  const used = new Set<string>();

  function takeFromPool(type: QuestionType): Partial<GeneratedQuestion> | undefined {
    const matchIdx = pool.findIndex(
      (q) => !used.has(q.id) && (q.type === type || !q.type)
    );
    if (matchIdx >= 0) {
      used.add(pool[matchIdx].id);
      return pool[matchIdx];
    }
    const anyIdx = pool.findIndex((q) => !used.has(q.id));
    if (anyIdx >= 0) {
      used.add(pool[anyIdx].id);
      return pool[anyIdx];
    }
    return undefined;
  }

  let globalNum = 1;
  const sections = input.questionTypes.map((qt, sIdx) => {
    const def = getQuestionTypeDefinition(qt.type);
    const label = String.fromCharCode(65 + sIdx);
    const questions: GeneratedQuestion[] = [];

    for (let i = 0; i < qt.count; i++) {
      const raw = takeFromPool(qt.type);
      const number = globalNum++;
      const normalized = raw?.text?.trim()
        ? normalizeQuestionShape(
            {
              ...raw,
              type: isValidType(raw?.type ?? '') ? raw!.type : qt.type,
            },
            qt.type,
            qt.marksPerQuestion,
            number,
            label,
            i
          )
        : buildQuestionForType(
            qt.type,
            input,
            i,
            number,
            qt.marksPerQuestion,
            label
          );
      questions.push(normalized);
    }

    return {
      id: `section-${label.toLowerCase()}`,
      label,
      title: fromSource ? '' : def.sectionTitle,
      instruction: fromSource ? '' : def.sectionInstruction(qt.marksPerQuestion),
      questions,
    };
  });

  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  return {
    title: parsed.title || input.title,
    subject: parsed.subject || input.subject || 'General',
    totalMarks,
    durationMinutes:
      parsed.durationMinutes ?? Math.max(45, Math.ceil(totalMarks * 1.5)),
    sections,
    generatedAt: parsed.generatedAt || new Date().toISOString(),
    displayStyle: fromSource ? 'chat' : 'exam',
  };
}
