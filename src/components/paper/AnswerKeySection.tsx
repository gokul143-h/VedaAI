import type { AnswerKeyEntry } from '@/lib/paperTypes';

interface AnswerKeySectionProps {
  entries: AnswerKeyEntry[];
}

export function AnswerKeySection({ entries }: AnswerKeySectionProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-12 break-inside-avoid border-t border-paper-ink/20 pt-8">
      <h2 className="font-display mb-6 text-center text-lg font-bold text-paper-ink">
        Answer Key
      </h2>
      <ol className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.number} className="text-sm text-paper-ink">
            <span className="font-bold">Q{entry.number}.</span> {entry.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
