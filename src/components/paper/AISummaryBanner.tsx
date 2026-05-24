'use client';

import { FileText, Loader2 } from 'lucide-react';

interface AISummaryBannerProps {
  onDownload: () => void;
  isDownloading?: boolean;
  message: string;
}

export function AISummaryBanner({
  onDownload,
  isDownloading,
  message,
}: AISummaryBannerProps) {
  return (
    <div className="max-w-[720px] rounded-[20px] bg-[#2f2f2f] px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.18)] sm:px-6 sm:py-6">
      <p className="text-[15px] leading-relaxed text-zinc-100">{message}</p>
      <button
        type="button"
        onClick={onDownload}
        disabled={isDownloading}
        className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-sm transition hover:bg-zinc-100 disabled:opacity-60"
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" strokeWidth={2} />
        )}
        Download as PDF
      </button>
    </div>
  );
}
