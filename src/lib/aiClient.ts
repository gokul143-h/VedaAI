import type { AssignmentFormData, GeneratedPaper } from '@/types';

export interface AiHealthStatus {
  llmEnabled: boolean;
  provider?: string;
  model: string;
  visionModel: string;
  hasApiKey: boolean;
  useMockAi?: boolean;
  baseUrl: string;
  requiredEnvVar?: string;
  setupUrl?: string;
}

export interface GeneratePaperResult {
  id: string;
  status: string;
  paper: GeneratedPaper;
  usedSourceMaterial?: boolean;
}

export async function getAiHealth(): Promise<AiHealthStatus> {
  const res = await fetch('/api/ai/health', { cache: 'no-store' });
  if (!res.ok) throw new Error('AI health check failed');
  return res.json();
}

export async function generateAssignmentPaper(
  data: AssignmentFormData
): Promise<GeneratePaperResult> {
  const payload = {
    title: data.title,
    subject: data.subject || undefined,
    dueDate: data.dueDate,
    questionTypes: data.questionTypes,
    additionalInstructions: data.additionalInstructions || undefined,
  };

  let res: Response;

  if (data.file) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    formData.append('file', data.file);
    res = await fetch('/api/ai/generate', {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof json.error === 'string' ? json.error : 'Failed to generate paper'
    );
  }

  return json as GeneratePaperResult;
}
