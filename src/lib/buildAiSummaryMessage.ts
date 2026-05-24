import type { GeneratedPaper } from '@/types';

export interface AiSummaryContext {
  paper: GeneratedPaper;
  teacherName?: string;
  teacherPrompt?: string;
  sourceFileName?: string;
}

function topicLabel(paper: GeneratedPaper, sourceFileName?: string): string {
  if (paper.title?.trim()) return paper.title.trim();
  if (sourceFileName) {
    return sourceFileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  }
  return 'your material';
}

export function buildAiSummaryMessage(ctx: AiSummaryContext): string {
  const name = ctx.teacherName?.trim();
  const greeting = name ? `Certainly, ${name}!` : 'Certainly!';
  const topic = topicLabel(ctx.paper, ctx.sourceFileName);
  const subject = ctx.paper.subject?.trim();
  const prompt = ctx.teacherPrompt?.toLowerCase() ?? '';
  const isChat = ctx.paper.displayStyle === 'chat';
  const isTrivia = /trivia|game\s*night|quiz\s*night/.test(prompt);

  if (isChat || isTrivia) {
    const label = isTrivia ? 'trivia questions' : 'questions';
    return `${greeting} Here are ${label} from ${topic}:`;
  }

  if (subject && subject !== 'General') {
    return `${greeting} Here is your customized question paper for your ${subject} class on ${topic}:`;
  }

  return `${greeting} Here is your customized question paper for ${topic}:`;
}
