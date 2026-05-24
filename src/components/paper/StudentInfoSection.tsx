'use client';

export function StudentInfoSection() {
  const fields = ['Name', 'Roll Number', 'Class/Section'];

  return (
    <div className="mb-8 space-y-4">
      {fields.map((label) => (
        <div key={label} className="flex items-end gap-3">
          <span className="shrink-0 text-sm font-medium text-paper-ink">
            {label}:
          </span>
          <div className="exam-line min-h-[1.5rem] flex-1 border-b border-paper-ink/40" />
        </div>
      ))}
    </div>
  );
}
