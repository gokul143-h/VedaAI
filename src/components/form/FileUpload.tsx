'use client';

import { useRef, useState } from 'react';
import { CloudUpload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const ACCEPT = 'image/jpeg,image/png,application/pdf,.pdf,.jpg,.jpeg,.png';

export function FileUpload({ file, onChange, error }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const picked = files?.[0];
    if (picked) onChange(picked);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
          error
            ? 'border-red-300 bg-red-50/50'
            : dragOver
              ? 'border-brand-400 bg-brand-50/30'
              : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300'
        }`}
      >
        {file ? (
          <div
            className="flex w-full max-w-sm items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="h-9 w-9 shrink-0 text-brand-500" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
              <p className="text-xs text-ink-muted">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-ink"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <CloudUpload className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-center text-sm font-semibold text-ink">
              Choose a file or drag &amp; drop it here
            </p>
            <p className="mt-1 text-center text-xs text-ink-muted">
              JPEG, PNG, upto 10MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="mt-5 rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Browse Files
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-3 text-center text-xs text-ink-muted">
        Upload images of your preferred document/image
      </p>

      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
