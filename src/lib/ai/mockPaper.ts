import type { GeneratedPaper } from '@/types';
import { getQuestionTypeDefinition } from '@/lib/questionTypes';
import { buildQuestionForType } from './questionBuilders';
import type { GenerationInput } from './types';
import { usesSourceDrivenStyle } from './promptBuilder';

export function generateMockPaper(input: GenerationInput): GeneratedPaper {
  const fromSource = usesSourceDrivenStyle(input);
  let globalNum = 1;

  const sections = input.questionTypes.map((qt, idx) => {
    const label = String.fromCharCode(65 + idx);
    const def = getQuestionTypeDefinition(qt.type);
    const questions = Array.from({ length: qt.count }, (_, i) => {
      const q = buildQuestionForType(
        qt.type,
        input,
        i,
        globalNum++,
        qt.marksPerQuestion,
        label
      );
      return q;
    });

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
    title: fromSource
      ? inferTitleFromSource(input) || input.title
      : input.title,
    subject: input.subject || 'General',
    totalMarks,
    durationMinutes: Math.max(45, Math.ceil(totalMarks * 1.5)),
    sections,
    generatedAt: new Date().toISOString(),
    displayStyle: fromSource ? 'chat' : 'exam',
  };
}

function inferTitleFromSource(input: GenerationInput): string {
  const text = input.sourceText?.trim() || '';
  const chapter = text.match(/Chapter\s+[IVXLC\d]+[:\s—-]+([^\n.]{3,60})/i);
  if (chapter) return chapter[0].trim();
  const firstLine = text.split(/[.\n]/).find((l) => l.trim().length > 8);
  return firstLine?.trim().slice(0, 80) || '';
}
