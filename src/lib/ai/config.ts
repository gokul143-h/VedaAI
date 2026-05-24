/** Default Groq models (OpenAI-compatible). Override via env vars. */
export const DEFAULT_LLM_MODEL = 'llama-3.1-70b-versatile';
export const DEFAULT_VISION_MODEL = 'llama-3.2-11b-vision-preview';
export const DEFAULT_LLM_BASE_URL = 'https://api.groq.com/openai/v1';
export const DEFAULT_OPENWEBUI_BASE_URL = 'http://localhost:8080/api';

export type AiProvider = 'groq' | 'openwebui' | 'openai';

const PLACEHOLDER_PATTERNS =
  /^(your_|sk-your|gsk-your|xxx|changeme|placeholder|test_key)/i;

export function resolveProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === 'openwebui' || explicit === 'open-webui') return 'openwebui';
  if (process.env.OPENWEBUI_BASE_URL?.trim()) return 'openwebui';
  if (explicit === 'openai') return 'openai';
  return 'groq';
}

/** Reject empty, placeholder, or obviously invalid keys */
export function isValidApiKey(key: string, provider: AiProvider = 'groq'): boolean {
  const k = key.trim();
  if (!k) return false;
  if (PLACEHOLDER_PATTERNS.test(k)) return false;
  if (/^your_openai_api_key$/i.test(k)) return false;

  if (provider === 'openwebui') {
    return k.length >= 8;
  }

  return k.length >= 20;
}

export function resolveApiKey(provider: AiProvider): string {
  const raw =
    (provider === 'openwebui'
      ? process.env.OPENWEBUI_API_KEY?.trim() ||
        process.env.OPENAI_API_KEY?.trim()
      : undefined) ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    '';

  return isValidApiKey(raw, provider) ? raw : '';
}

/** Open WebUI serves chat at /api/chat/completions (not /api/v1). */
export function normalizeOpenWebUiBaseUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/v1$/, '');
}

export function resolveBaseUrl(provider: AiProvider): string {
  if (provider === 'openwebui') {
    const url =
      process.env.OPENWEBUI_BASE_URL?.trim() ||
      process.env.OPENAI_BASE_URL?.trim() ||
      DEFAULT_OPENWEBUI_BASE_URL;
    return normalizeOpenWebUiBaseUrl(url);
  }

  return (
    process.env.GROQ_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    DEFAULT_LLM_BASE_URL
  );
}

const provider = resolveProvider();
const apiKey = resolveApiKey(provider);
const baseUrl = resolveBaseUrl(provider);

export const aiConfig = {
  provider,
  apiKey,
  model: process.env.OPENAI_MODEL?.trim() || DEFAULT_LLM_MODEL,
  visionModel:
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    DEFAULT_VISION_MODEL,
  baseUrl,
  useMock: process.env.USE_MOCK_AI === 'true' || !apiKey,
  useJsonResponseFormat: provider !== 'openwebui',
};

export function getAiHealthInfo() {
  return {
    llmEnabled: true,
    provider: aiConfig.provider,
    model: aiConfig.useMock ? 'mock' : aiConfig.model,
    visionModel: aiConfig.visionModel,
    hasApiKey: Boolean(aiConfig.apiKey),
    useMockAi: aiConfig.useMock,
    baseUrl: aiConfig.baseUrl,
  };
}

export function assertApiKeyConfigured(forVision = false): void {
  if (aiConfig.apiKey) return;

  if (aiConfig.provider === 'openwebui') {
    throw new Error(
      forVision
        ? 'Open WebUI API key is required for image uploads. Add OPENWEBUI_API_KEY to .env.local (Settings → Account in Open WebUI).'
        : 'Open WebUI API key is missing. Add OPENWEBUI_API_KEY to .env.local or set USE_MOCK_AI=true for demo mode.'
    );
  }

  throw new Error(
    forVision
      ? 'Groq API key is required for image uploads. Add GROQ_API_KEY (starts with gsk_) to .env.local — https://console.groq.com/keys'
      : 'Groq API key is missing. Add GROQ_API_KEY to .env.local or set USE_MOCK_AI=true for demo mode.'
  );
}

export function formatProviderError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/401|invalid api key|incorrect api key|unauthorized/i.test(message)) {
    if (aiConfig.provider === 'openwebui') {
      return (
        'Invalid Open WebUI API key (401). Copy your key from Open WebUI → Settings → Account ' +
        'and set OPENWEBUI_API_KEY in .env.local, then restart npm run dev. ' +
        'Or set USE_MOCK_AI=true to generate sample questions without an API key.'
      );
    }
    return (
      'Invalid API key (401). Use a free Groq key (gsk_...) from https://console.groq.com/keys ' +
      'in .env.local as GROQ_API_KEY=..., then restart npm run dev. ' +
      'Or set USE_MOCK_AI=true to generate sample questions without an API key.'
    );
  }
  if (/429|rate limit/i.test(message)) {
    return aiConfig.provider === 'openwebui'
      ? 'Open WebUI rate limit reached. Wait a moment and try again.'
      : 'Groq rate limit reached. Wait a moment and try again.';
  }
  if (/model.*not found|does not exist/i.test(message)) {
    return (
      `Model "${aiConfig.model}" was not found. Set OPENAI_MODEL in .env.local to the exact model ID shown in Open WebUI.`
    );
  }
  return message;
}

export function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /401|invalid api key|incorrect api key|unauthorized/i.test(message);
}
