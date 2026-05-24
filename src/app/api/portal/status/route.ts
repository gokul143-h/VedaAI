import { getAiHealthInfo } from '@/lib/ai/config';

function toWsUrl(httpUrl: string): string {
  const trimmed = httpUrl.replace(/\/$/, '');
  if (trimmed.startsWith('https://')) return `wss://${trimmed.slice(8)}/ws`;
  if (trimmed.startsWith('http://')) return `ws://${trimmed.slice(7)}/ws`;
  return '';
}

export async function GET() {
  const ai = getAiHealthInfo();
  const backend =
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';

  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL?.trim() || (backend ? toWsUrl(backend) : '');

  let backendReady = false;
  if (backend) {
    try {
      const res = await fetch(`${backend.replace(/\/$/, '')}/health`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as { ready?: boolean };
        backendReady = json.ready === true;
      }
    } catch {
      backendReady = false;
    }
  }

  const aiReady = !ai.useMockAi || true;
  const portalReady = aiReady || backendReady;

  return Response.json({
    portalReady,
    ai: {
      ready: aiReady,
      useMockAi: ai.useMockAi,
      provider: ai.provider,
      model: ai.model,
      hasApiKey: ai.hasApiKey,
      requiredEnvVar: ai.requiredEnvVar,
      setupUrl: ai.setupUrl,
    },
    backend: {
      configured: Boolean(backend),
      ready: backendReady,
      apiBaseUrl: backend ? '/api/backend' : '',
      wsUrl,
    },
    createUrl: '/create',
    assignmentsUrl: '/assignments',
  });
}
