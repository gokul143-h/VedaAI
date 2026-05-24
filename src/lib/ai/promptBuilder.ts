import { getQuestionTypeDefinition } from '@/lib/questionTypes';
import type { GenerationInput } from './types';

function buildExamPrompt(input: GenerationInput): string {
  const sectionPlan = input.questionTypes
    .map((qt, idx) => {
      const label = String.fromCharCode(65 + idx);
      const def = getQuestionTypeDefinition(qt.type);
      return `Section ${label} — ${def.sectionTitle}
  - type: "${qt.type}"
  - count: exactly ${qt.count} questions
  - marks: ${qt.marksPerQuestion} per question
  - rules: ${def.aiRules}`;
    })
    .join('\n\n');

  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  return `Generate a formal question paper.

ASSIGNMENT:
- Title: ${input.title}
- Subject: ${input.subject || 'General'}
- Total questions: ${totalQuestions}
- Total marks: ${totalMarks}

SECTION PLAN:
${sectionPlan}

${input.additionalInstructions ? `TEACHER NOTES:\n${input.additionalInstructions}\n` : ''}

Return ONLY valid JSON.`;
}

function buildSourcePrompt(input: GenerationInput): string {
  const teacherAsk =
    input.additionalInstructions?.trim() ||
    'Generate questions based on the uploaded material.';

  const typePlan = input.questionTypes
    .map((qt, idx) => {
      const label = String.fromCharCode(65 + idx);
      return `- Section ${label}: ${qt.count} × ${qt.type} (${qt.marksPerQuestion} marks each)`;
    })
    .join('\n');

  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  return `You are helping a teacher write questions from uploaded material.

TEACHER NOTES:
${teacherAsk}

UPLOADED PAGE CONTENT (every question MUST be answerable using ONLY this text):
---
${input.sourceText!.slice(0, 10000)}
---

OUTPUT RULES:
1. Write ${totalQuestions} direct questions — plain question sentences only.
2. Do NOT add introductions ("Here are some questions..."), round titles ("Easy Round"), or commentary.
3. Do NOT repeat the source text — only ask questions about it.
4. Match difficulty mix: ~30% easy, ~50% medium, ~20% hard.
5. Follow this structure for types and counts:
${typePlan}
6. MCQ: 4 options as strings. Other types: no options field.
7. Use empty string for each section "title" and "instruction".
8. "title" field in JSON = short topic from the page (e.g. book chapter name), not a school exam title.

Return ONLY valid JSON:
{
  "title": "short topic from material",
  "subject": "string",
  "totalMarks": ${totalMarks},
  "durationMinutes": 30,
  "sections": [ ... ]
}`;
}

export function buildGenerationPrompt(input: GenerationInput): string {
  const base = input.sourceText?.trim()
    ? buildSourcePrompt(input)
    : buildExamPrompt(input);

  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  return `${base}

JSON SCHEMA (all questions numbered 1..N across the paper):
{
  "title": "string",
  "subject": "string",
  "totalMarks": ${totalMarks},
  "durationMinutes": number,
  "sections": [{
    "id": "section-a",
    "label": "A",
    "title": "",
    "instruction": "",
    "questions": [{
      "id": "q1",
      "number": 1,
      "text": "direct question only",
      "difficulty": "easy|medium|hard",
      "marks": number,
      "type": "multiple_choice|short_answer|long_answer|true_false|fill_blank",
      "options": ["only for multiple_choice"]
    }]
  }]
}`;
}

export function usesSourceDrivenStyle(input: GenerationInput): boolean {
  return Boolean(input.sourceText?.trim());
}
