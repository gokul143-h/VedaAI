import type { GeneratedPaper } from '@/types';
import { usesSourceDrivenStyle } from './promptBuilder';
import { normalizePaperToQuestionTypes } from './normalizePaper';
import type { GenerationInput } from './types';

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in AI response');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function parseAndValidatePaper(
  raw: string,
  input: GenerationInput
): GeneratedPaper {
  const parsed = extractJson(raw) as {
    title?: string;
    subject?: string;
    totalMarks?: number;
    durationMinutes?: number;
    generatedAt?: string;
    sections?: Array<{
      id?: string;
      label?: string;
      title?: string;
      instruction?: string;
      questions?: Array<{
        id?: string;
        number?: number;
        text?: string;
        difficulty?: string;
        marks?: number;
        type?: string;
        options?: string[];
      }>;
    }>;
  };

  if (!parsed.sections?.length) {
    throw new Error('AI response missing sections');
  }

  const rough: GeneratedPaper = {
    title: parsed.title || input.title,
    subject: parsed.subject || input.subject || 'General',
    totalMarks: parsed.totalMarks ?? 0,
    durationMinutes: parsed.durationMinutes ?? 60,
    generatedAt: new Date().toISOString(),
    sections: parsed.sections.map((section, sIdx) => ({
      id: section.id || `section-${sIdx}`,
      label: section.label || String.fromCharCode(65 + sIdx),
      title: section.title || `Section ${section.label}`,
      instruction: section.instruction || '',
      questions: (section.questions ?? []).map((q, i) => ({
        id: q.id || `q-${i}`,
        number: q.number ?? i + 1,
        text: q.text || '',
        difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty ?? '')
          ? q.difficulty
          : 'medium') as 'easy' | 'medium' | 'hard',
        marks: q.marks ?? 1,
        type: (q.type || 'short_answer') as GeneratedPaper['sections'][0]['questions'][0]['type'],
        ...(q.options?.length ? { options: q.options } : {}),
      })),
    })),
  };

  return normalizePaperToQuestionTypes(
    rough,
    input,
    usesSourceDrivenStyle(input)
  );
}
