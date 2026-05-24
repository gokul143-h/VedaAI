'use client';

import { Download, RefreshCw, Loader2 } from 'lucide-react';

interface ActionBarProps {
  onDownload: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  isDownloading?: boolean;
}

export function ActionBar({
  onDownload,
  onRegenerate,
  isRegenerating,
  isDownloading,
}: ActionBarProps) {
  return (
    <div className="no-print sticky bottom-4 z-30 mx-auto flex max-w-3xl justify-center gap-3 px-4">
      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="btn-secondary"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Regenerate
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="btn-primary"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </button>
      </div>
    </div>
  );
}
