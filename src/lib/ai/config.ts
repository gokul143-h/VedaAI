/** Meta Llama API (OpenAI-compatible). See https://llama.developer.meta.com */
export const DEFAULT_META_BASE_URL = 'https://api.llama.com/compat/v1';
export const DEFAULT_META_LLM_MODEL = 'Llama-3.3-70B-Instruct';
export const DEFAULT_META_VISION_MODEL = 'Llama-4-Scout-17B-16E-Instruct-FP8';

/** Groq-hosted Llama models (OpenAI-compatible). Override via env vars. */
export const DEFAULT_GROQ_LLM_MODEL = 'llama-3.1-70b-versatile';
export const DEFAULT_GROQ_VISION_MODEL = 'llama-3.2-11b-vision-preview';
export const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const DEFAULT_OPENWEBUI_BASE_URL = 'http://localhost:8080/api';

export type AiProvider = 'meta' | 'groq' | 'openwebui' | 'openai';

const PLACEHOLDER_PATTERNS =
  /^(your_|sk-your|gsk-your|xxx|changeme|placeholder|test_key)/i;

function rawKeyForProvider(provider: AiProvider): string {
  if (provider === 'meta') return process.env.LLAMA_API_KEY?.trim() || '';
  if (provider === 'openwebui') {
    return (
      process.env.OPENWEBUI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      ''
    );
  }
  return (
    process.env.GROQ_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    ''
  );
}

function firstProviderWithKey(): AiProvider | null {
  // Groq first — free Llama hosting, simplest for Vercel production
  for (const provider of ['groq', 'meta', 'openwebui'] as const) {
    const key = rawKeyForProvider(provider);
    if (isValidApiKey(key, provider)) return provider;
  }
  return null;
}

export function resolveProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === 'openwebui' || explicit === 'open-webui') return 'openwebui';
  if (process.env.OPENWEBUI_BASE_URL?.trim()) return 'openwebui';

  const fromKey = firstProviderWithKey();
  if (fromKey) return fromKey;

  // Only use explicit provider when a matching key exists (avoid meta without LLAMA_API_KEY)
  if (explicit === 'meta' || explicit === 'llama') {
    return isValidApiKey(rawKeyForProvider('meta'), 'meta') ? 'meta' : 'groq';
  }
  if (explicit === 'groq') return 'groq';
  if (explicit === 'openai') return 'groq';
  return 'groq';
}

/** Reject empty, placeholder, or obviously invalid keys */
export function isValidApiKey(key: string, provider: AiProvider = 'meta'): boolean {
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
  const raw = rawKeyForProvider(provider);
  return isValidApiKey(raw, provider) ? raw : '';
}

export function getRequiredApiKeyEnvVar(provider?: AiProvider): string {
  const p = provider ?? resolveProvider();
  if (p === 'meta') return 'LLAMA_API_KEY';
  if (p === 'openwebui') return 'OPENWEBUI_API_KEY';
  return 'GROQ_API_KEY';
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

  if (provider === 'meta') {
    return (
      process.env.LLAMA_BASE_URL?.trim() ||
      process.env.META_LLM_BASE_URL?.trim() ||
      DEFAULT_META_BASE_URL
    );
  }

  return (
    process.env.GROQ_BASE_URL?.trim() ||
    process.env.OPENAI_BASE_URL?.trim() ||
    DEFAULT_GROQ_BASE_URL
  );
}

function resolveDefaultModel(provider: AiProvider): string {
  if (provider === 'meta') return DEFAULT_META_LLM_MODEL;
  return DEFAULT_GROQ_LLM_MODEL;
}

function resolveDefaultVisionModel(provider: AiProvider): string {
  if (provider === 'meta') return DEFAULT_META_VISION_MODEL;
  return DEFAULT_GROQ_VISION_MODEL;
}

const provider = resolveProvider();
const apiKey = resolveApiKey(provider);
const baseUrl = resolveBaseUrl(provider);

function shouldUseMock(): boolean {
  if (process.env.USE_MOCK_AI === 'true') return true;
  if (process.env.USE_MOCK_AI === 'false') return !apiKey;
  return !apiKey;
}

export const aiConfig = {
  provider,
  apiKey,
  model: process.env.OPENAI_MODEL?.trim() || resolveDefaultModel(provider),
  visionModel:
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    resolveDefaultVisionModel(provider),
  baseUrl,
  useMock: shouldUseMock(),
  useJsonResponseFormat: provider !== 'openwebui',
};

export function getAiHealthInfo() {
  const requiredEnvVar = getRequiredApiKeyEnvVar(aiConfig.provider);
  return {
    llmEnabled: true,
    provider: aiConfig.provider,
    model: aiConfig.useMock ? 'mock' : aiConfig.model,
    visionModel: aiConfig.visionModel,
    hasApiKey: Boolean(aiConfig.apiKey),
    useMockAi: aiConfig.useMock,
    baseUrl: aiConfig.baseUrl,
    requiredEnvVar,
    setupUrl:
      aiConfig.provider === 'meta'
        ? 'https://llama.developer.meta.com/'
        : 'https://console.groq.com/keys',
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

  if (aiConfig.provider === 'meta') {
    throw new Error(
      forVision
        ? 'Llama API key is required for image uploads. Add LLAMA_API_KEY to .env.local — https://llama.developer.meta.com/'
        : 'Llama API key is missing. Add LLAMA_API_KEY to .env.local or set USE_MOCK_AI=true for demo mode.'
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
    if (aiConfig.provider === 'meta') {
      return (
        'Invalid Llama API key (401). Create a key at https://llama.developer.meta.com/ ' +
        'and set LLAMA_API_KEY in .env.local, then restart npm run dev. ' +
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
    if (aiConfig.provider === 'openwebui') {
      return 'Open WebUI rate limit reached. Wait a moment and try again.';
    }
    if (aiConfig.provider === 'meta') {
      return 'Llama API rate limit reached. Wait a moment and try again.';
    }
    return 'Groq rate limit reached. Wait a moment and try again.';
  }
  if (/model.*not found|does not exist/i.test(message)) {
    if (aiConfig.provider === 'meta') {
      return (
        `Model "${aiConfig.model}" was not found. Set OPENAI_MODEL in .env.local to a Llama model ID from https://llama.developer.meta.com/docs/models/`
      );
    }
  }
  return message;
}

export function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /401|invalid api key|incorrect api key|unauthorized/i.test(message);
}
