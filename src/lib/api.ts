import type {
  AssignmentFormData,
  AssignmentListItem,
  AssignmentResponse,
  GeneratedPaper,
  JobStatus,
} from '@/types';
import { mapQuestionTypesToBackend } from './questionTypeMap';
import { getApiBaseUrl, shouldUseExpressBackend } from './apiConfig';
import { isBackendConfigured } from './runtimeConfig';

export async function checkBackendHealth(): Promise<boolean> {
  if (!shouldUseExpressBackend()) return false;
  if (!(await isBackendConfigured())) return false;
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, { cache: 'no-store' });
    if (!res.ok) return false;
    const json = await res.json();
    return json.ready === true;
  } catch {
    return false;
  }
}

export async function createAssignment(
  data: AssignmentFormData
): Promise<{ id: string; jobId: string; status: JobStatus }> {
  const api = getApiBaseUrl();
  const questionConfigs = mapQuestionTypesToBackend(data.questionTypes);
  const totalQuestions = data.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = data.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  if (data.file) {
    const formData = new FormData();
    formData.append('title', data.title.trim());
    formData.append('dueDate', data.dueDate);
    formData.append('questionConfigs', JSON.stringify(questionConfigs));
    if (data.subject?.trim()) formData.append('subject', data.subject.trim());
    if (data.additionalInstructions?.trim()) {
      formData.append('additionalInstructions', data.additionalInstructions.trim());
    }
    formData.append('totalQuestions', String(totalQuestions));
    formData.append('totalMarks', String(totalMarks));
    formData.append('referenceFiles', data.file);

    const res = await fetch(`${api}/api/assignments`, {
      method: 'POST',
      body: formData,
    });
    return parseCreateResponse(res);
  }

  const res = await fetch(`${api}/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title.trim(),
      subject: data.subject?.trim() || undefined,
      dueDate: data.dueDate,
      questionConfigs,
      additionalInstructions: data.additionalInstructions?.trim() || undefined,
      totalQuestions,
      totalMarks,
    }),
  });

  return parseCreateResponse(res);
}

async function parseCreateResponse(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const msg =
      json.details?.map((d: { message: string }) => d.message).join(', ') ||
      json.message ||
      'Failed to create assignment';
    throw new Error(msg);
  }
  const d = json.data;
  return {
    id: d.id,
    jobId: d.jobId ?? '',
    status: d.status as JobStatus,
  };
}

export async function listAssignments(): Promise<AssignmentListItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/assignments`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  const rows = json.data ?? json;
  if (!Array.isArray(rows)) return [];
  return rows.map((a: Record<string, string>) => ({
    id: a.id,
    title: a.title,
    subject: a.subject,
    dueDate: a.dueDate,
    status: a.status as JobStatus,
    createdAt: a.createdAt,
  }));
}

export async function getAssignment(id: string): Promise<AssignmentResponse & { paper?: GeneratedPaper }> {
  const res = await fetch(`${getApiBaseUrl()}/api/assignments/${id}`, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || 'Failed to fetch assignment');
  }
  const d = json.data ?? json;
  return {
    id: d.id,
    title: d.title,
    subject: d.subject,
    dueDate: d.dueDate,
    status: d.status,
    jobId: d.jobId,
    paper: d.generatedPaper ?? d.paper,
    error: d.errorMessage,
  };
}

export async function getAssignmentStatus(id: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/assignments/${id}/status`, {
    cache: 'no-store',
  });
  const json = await res.json();
  return json.data ?? json;
}

export async function regenerateAssignment(id: string, additionalInstructions?: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/assignments/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ additionalInstructions }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Regenerate failed');
  return json.data;
}

export { getApiBaseUrl };
