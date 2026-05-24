export interface RuntimeConfig {
  backendConfigured: boolean;
  apiBaseUrl: string;
  wsUrl: string;
}

let cached: RuntimeConfig | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;

  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) {
      cached = { backendConfigured: false, apiBaseUrl: '', wsUrl: '' };
      return cached;
    }
    cached = (await res.json()) as RuntimeConfig;
    return cached;
  } catch {
    cached = { backendConfigured: false, apiBaseUrl: '', wsUrl: '' };
    return cached;
  }
}

export async function isBackendConfigured(): Promise<boolean> {
  const config = await getRuntimeConfig();
  return config.backendConfigured;
}
