import type { GeneratedPaper } from '@/types';

const PREFIX = 'vedaai-paper:';

export interface StoredPaper {
  paper: GeneratedPaper;
  dueDate?: string;
  title: string;
  createdAt: string;
  /** Step 2 chat prompt (e.g. trivia from uploaded page) */
  teacherPrompt?: string;
  sourceFileName?: string;
}

function read(id: string): StoredPaper | null {
  if (typeof window === 'undefined') return null;
  const key = `${PREFIX}${id}`;
  const raw =
    localStorage.getItem(key) ?? sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPaper;
  } catch {
    return null;
  }
}

export function savePaper(id: string, data: StoredPaper): void {
  if (typeof window === 'undefined') return;
  const key = `${PREFIX}${id}`;
  const json = JSON.stringify(data);
  localStorage.setItem(key, json);
  sessionStorage.setItem(key, json);
}

export function loadPaper(id: string): StoredPaper | null {
  return read(id);
}

export function hasPaper(id: string): boolean {
  return read(id) !== null;
}

export function createPaperId(): string {
  return `local-${crypto.randomUUID()}`;
}
