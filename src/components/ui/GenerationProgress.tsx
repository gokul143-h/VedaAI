'use client';

import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { JobStatus } from '@/types';

interface GenerationProgressProps {
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string | null;
}

export function GenerationProgress({
  status,
  progress,
  message,
  error,
}: GenerationProgressProps) {
  if (status === 'idle') return null;
  if (status === 'completed' && !error) return null;

  const isWorking = status === 'queued' || status === 'processing';

  const isFailed = status === 'failed';

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isFailed
          ? 'border-red-200 bg-red-50'
          : 'border-brand-200 bg-brand-50/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {isFailed ? (
          <XCircle className="h-6 w-6 shrink-0 text-red-500" />
        ) : (
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-brand-600" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            {isFailed
              ? 'Generation Failed'
              : status === 'queued'
                ? 'Queued for AI Generation'
                : 'Generating Question Paper'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {error ||
              message ||
              (isWorking
                ? 'Your LLM is building sections, questions, and marks...'
                : 'Please wait...')}
          </p>
          {!isFailed && isWorking && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-slate-500">{progress}%</p>
            </div>
          )}
        </div>
        {!isFailed && (
          <CheckCircle2 className="h-5 w-5 text-brand-400 opacity-40" />
        )}
      </div>
    </div>
  );
}
