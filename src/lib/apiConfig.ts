/**
 * API / WebSocket URLs.
 * - Local/LAN dev: same hostname as the page, port 4000
 * - Vercel production: NEXT_PUBLIC_API_URL or same-origin /api/backend proxy
 */
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '4000';

/** Same-origin proxy to Render/local API (see app/api/backend/[...path]/route.ts) */
export const BACKEND_PROXY_PREFIX = '/api/backend';

function trimSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  );
}

function isLocalApiUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return isLocalHostname(host);
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

export function isProductionBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname } = window.location;
  return protocol === 'https:' && !isLocalHostname(hostname);
}

function vercelProductionDefaultApi(): string | undefined {
  const host =
    typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'vedaai-omega.vercel.app' || host.endsWith('.vercel.app')) {
    return BACKEND_PROXY_PREFIX;
  }
  return undefined;
}

export function getApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit && !(isProductionBrowser() && isLocalApiUrl(explicit))) {
    return trimSlash(explicit);
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (isLocalHostname(hostname)) {
      return `${protocol}//${hostname}:${API_PORT}`;
    }
    const vercelDefault = vercelProductionDefaultApi();
    if (vercelDefault) return vercelDefault;
  }

  if (process.env.NODE_ENV === 'production') {
    return BACKEND_PROXY_PREFIX;
  }

  return `http://localhost:${API_PORT}`;
}

export function getWsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit && !(isProductionBrowser() && isLocalApiUrl(explicit))) {
    return trimSlash(explicit);
  }

  const api = getApiBaseUrl();
  if (api === BACKEND_PROXY_PREFIX || api.startsWith('/')) {
    const remote = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (remote && !isLocalApiUrl(remote)) {
      const wsProtocol = remote.startsWith('https') ? 'wss' : 'ws';
      const host = remote.replace(/^https?:\/\//, '');
      return `${wsProtocol}://${host}/ws`;
    }
    return '';
  }

  const wsProtocol = api.startsWith('https') ? 'wss' : 'ws';
  const host = api.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${host}/ws`;
}

/** True when we should try the Express API (direct URL or /api/backend proxy). */
export function shouldUseExpressBackend(): boolean {
  const base = getApiBaseUrl();
  if (!base) return false;
  if (base === BACKEND_PROXY_PREFIX || base.startsWith('/')) return true;
  if (isProductionBrowser() && isLocalApiUrl(base)) return false;
  return true;
}
