'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';

interface PortalStatus {
  portalReady: boolean;
  ai: {
    ready: boolean;
    useMockAi: boolean;
    provider: string;
    model: string;
    hasApiKey: boolean;
  };
  backend: {
    configured: boolean;
    ready: boolean;
    apiBaseUrl: string;
  };
}

export default function PortalPage() {
  const [status, setStatus] = useState<PortalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const aiLabel = status?.ai.useMockAi
    ? 'Demo mode (sample questions)'
    : `Live — ${status?.ai.model}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="VedaAI Portal" />

      <main className="flex flex-1 flex-col overflow-y-auto px-5 py-8 pb-28 sm:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-ink">
                VedaAI Portal
              </h1>
              <p className="text-sm text-ink-muted">
                Open this site to create AI question papers — no local server needed.
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-zinc-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8">
            <h2 className="text-lg font-bold text-ink">System status</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Frontend and AI run on this website. Backend API is optional.
            </p>

            {loading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking services…
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                <StatusRow
                  ok={Boolean(status?.portalReady)}
                  title="Portal"
                  detail={
                    status?.portalReady
                      ? 'Ready — click Create Assignment below'
                      : 'Starting up…'
                  }
                />
                <StatusRow
                  ok={Boolean(status?.ai.ready)}
                  title="AI generation"
                  detail={aiLabel}
                />
                <StatusRow
                  ok={Boolean(status?.backend.ready)}
                  title="Backend API (optional)"
                  detail={
                    status?.backend.ready
                      ? 'Connected via /api/backend'
                      : status?.backend.configured
                        ? 'Configured but not reachable'
                        : 'Using built-in AI on this site'
                  }
                  optional={!status?.backend.configured}
                />
              </ul>
            )}

            {!loading && status?.ai.useMockAi && (
              <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Demo mode — you can create assignments now. Add{' '}
                <code className="rounded bg-amber-100 px-1">GROQ_API_KEY</code> in
                Vercel for real Llama AI.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:bg-zinc-900"
              >
                Create Assignment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/assignments"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-zinc-50"
              >
                My Assignments
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusRow({
  ok,
  title,
  detail,
  optional,
}: {
  ok: boolean;
  title: string;
  detail: string;
  optional?: boolean;
}) {
  const Icon = ok ? CheckCircle2 : Circle;
  const color = ok
    ? 'text-emerald-600'
    : optional
      ? 'text-zinc-400'
      : 'text-amber-500';

  return (
    <li className="flex items-start gap-3">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-ink-muted">{detail}</p>
      </div>
    </li>
  );
}
