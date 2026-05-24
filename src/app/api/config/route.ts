function toWsUrl(httpUrl: string): string {
  const trimmed = httpUrl.replace(/\/$/, '');
  if (trimmed.startsWith('https://')) return `wss://${trimmed.slice(8)}/ws`;
  if (trimmed.startsWith('http://')) return `ws://${trimmed.slice(7)}/ws`;
  return '';
}

export async function GET() {
  const backend =
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';

  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL?.trim() || (backend ? toWsUrl(backend) : '');

  return Response.json({
    backendConfigured: Boolean(backend),
    apiBaseUrl: backend ? '/api/backend' : '',
    wsUrl,
  });
}
