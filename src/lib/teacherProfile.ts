const STORAGE_KEY = 'vedaai-teacher-name';

export function getTeacherName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY)?.trim() ?? '';
}

export function setTeacherName(name: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
