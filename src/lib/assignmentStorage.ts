import type { AssignmentListItem } from '@/types';
import { loadPaper } from './paperStorage';

const KEY = 'vedaai-assignments';

function attachStoredPaper(item: AssignmentListItem): AssignmentListItem {
  if (item.paper?.sections?.some((s) => s.questions.length > 0)) {
    return item;
  }
  const stored = loadPaper(item.id);
  if (stored?.paper) {
    return { ...item, paper: stored.paper };
  }
  return item;
}

export function listLocalAssignments(): AssignmentListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssignmentListItem[];
    if (!Array.isArray(parsed)) return [];
    // Drop legacy placeholder entries from earlier builds
    return parsed
      .filter((a) => a.title?.trim() && a.title !== 'New Assignment')
      .map(attachStoredPaper);
  } catch {
    return [];
  }
}

export function getLocalAssignment(id: string): AssignmentListItem | null {
  return listLocalAssignments().find((a) => a.id === id) ?? null;
}

export function addLocalAssignment(item: AssignmentListItem): void {
  if (typeof window === 'undefined') return;
  const list = listLocalAssignments();
  const next = [item, ...list.filter((a) => a.id !== item.id)];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getLocalAssignmentCount(): number {
  return listLocalAssignments().length;
}

export function removeLocalAssignment(id: string): void {
  if (typeof window === 'undefined') return;
  const next = listLocalAssignments().filter((a) => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  localStorage.removeItem(`vedaai-paper:${id}`);
  sessionStorage.removeItem(`vedaai-paper:${id}`);
}
