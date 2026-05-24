'use client';

interface FormProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export function FormProgressBar({
  currentStep,
  totalSteps = 2,
}: FormProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mx-auto w-full max-w-3xl px-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200/80">
        <div
          className="h-full rounded-full bg-ink transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
