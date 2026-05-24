/** Meta Llama 3.1 70B on Groq (OpenAI-compatible). Override via env vars. */
export const DEFAULT_LLM_MODEL = 'llama-3.1-70b-versatile';
export const DEFAULT_VISION_MODEL = 'llama-3.2-11b-vision-preview';
export const DEFAULT_LLM_BASE_URL = 'https://api.groq.com/openai/v1';

const PLACEHOLDER_PATTERNS =
  /^(your_|sk-your|gsk-your|xxx|changeme|placeholder|test_key)/i;

/** Reject empty, placeholder, or obviously invalid keys */
export function isValidApiKey(key: string): boolean {
  const k = key.trim();
  if (k.length < 20) return false;
  if (PLACEHOLDER_PATTERNS.test(k)) return false;
  if (/^your_openai_api_key$/i.test(k)) return false;
  return true;
}

export function resolveApiKey(): string {
  const raw =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    '';
  return isValidApiKey(raw) ? raw : '';
}

export function resolveBaseUrl(): string {
  return (
    process.env.GROQ_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    DEFAULT_LLM_BASE_URL
  );
}

const apiKey = resolveApiKey();
const baseUrl = resolveBaseUrl();

export const aiConfig = {
  apiKey,
  model: process.env.OPENAI_MODEL?.trim() || DEFAULT_LLM_MODEL,
  visionModel:
    process.env.OPENAI_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL,
  baseUrl,
  useMock: process.env.USE_MOCK_AI === 'true' || !apiKey,
};

export function getAiHealthInfo() {
  return {
    llmEnabled: true,
    model: aiConfig.useMock ? 'mock' : aiConfig.model,
    visionModel: aiConfig.visionModel,
    hasApiKey: Boolean(aiConfig.apiKey),
    useMockAi: aiConfig.useMock,
    baseUrl: aiConfig.baseUrl,
  };
}

export function assertApiKeyConfigured(forVision = false): void {
  if (aiConfig.apiKey) return;
  throw new Error(
    forVision
      ? 'Groq API key is required for image uploads. Add GROQ_API_KEY (starts with gsk_) to frontend/.env.local — https://console.groq.com/keys'
      : 'Groq API key is missing. Add GROQ_API_KEY to frontend/.env.local or set USE_MOCK_AI=true for demo mode.'
  );
}

export function formatProviderError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/401|invalid api key|incorrect api key/i.test(message)) {
    return (
      'Invalid API key (401). Use a free Groq key (gsk_...) from https://console.groq.com/keys ' +
      'in frontend/.env.local as GROQ_API_KEY=..., then restart npm run dev. ' +
      'Or set USE_MOCK_AI=true to generate sample questions without an API key.'
    );
  }
  if (/429|rate limit/i.test(message)) {
    return 'Groq rate limit reached. Wait a moment and try again.';
  }
  return message;
}

export function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /401|invalid api key|incorrect api key/i.test(message);
}
