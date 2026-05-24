import type { GeneratedPaper } from '@/types';
import type { AnswerKeyEntry, PaperDisplayMeta } from '@/lib/paperTypes';
import { StudentInfoSection } from './StudentInfoSection';
import { QuestionItem } from './QuestionItem';
import { AnswerKeySection } from './AnswerKeySection';

interface QuestionPaperProps {
  paper: GeneratedPaper;
  meta?: PaperDisplayMeta;
  answerKey?: AnswerKeyEntry[];
}

export function QuestionPaper({
  paper,
  meta,
  answerKey = [],
}: QuestionPaperProps) {
  const isChatStyle = paper.displayStyle === 'chat';

  const displayMeta: PaperDisplayMeta = {
    subject: meta?.subject ?? paper.subject,
    durationMinutes: meta?.durationMinutes ?? paper.durationMinutes,
    totalMarks: meta?.totalMarks ?? paper.totalMarks,
    schoolHeading: meta?.schoolHeading,
    className: meta?.className,
  };

  const allQuestions = paper.sections.flatMap((s) => s.questions);

  if (isChatStyle) {
    return (
      <article
        id="question-paper"
        className="print-paper mx-auto max-w-[720px] rounded-2xl bg-white px-8 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/60 sm:px-12 sm:py-12"
      >
        <header className="mb-8 border-b border-paper-ink/10 pb-6">
          <h1 className="font-display text-xl font-bold leading-snug text-paper-ink sm:text-[22px]">
            {paper.title}
          </h1>
          {paper.subject && paper.subject !== 'General' && (
            <p className="mt-2 text-sm text-paper-muted">{paper.subject}</p>
          )}
        </header>

        <ol className="list-none space-y-1">
          {allQuestions.map((q) => (
            <QuestionItem key={q.id} question={q} variant="simple" />
          ))}
        </ol>
      </article>
    );
  }

  return (
    <article
      id="question-paper"
      className="print-paper mx-auto max-w-[720px] rounded-2xl bg-white px-8 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/60 sm:px-12 sm:py-12"
    >
      <header className="border-b border-paper-ink/20 pb-6 text-center">
        <h1 className="font-display text-xl font-bold text-paper-ink sm:text-[22px]">
          {displayMeta.schoolHeading || paper.title}
        </h1>
        {displayMeta.subject && (
          <p className="mt-3 text-sm font-semibold text-paper-ink">
            Subject: {displayMeta.subject}
          </p>
        )}
        {displayMeta.className && (
          <p className="mt-1 text-sm text-paper-muted">
            Class: {displayMeta.className}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between text-sm text-paper-ink">
          <span>
            Time Allowed:{' '}
            <strong>{displayMeta.durationMinutes} minutes</strong>
          </span>
          <span>
            Maximum Marks: <strong>{displayMeta.totalMarks}</strong>
          </span>
        </div>
      </header>

      <p className="mt-5 text-center text-xs italic text-paper-muted">
        All questions are compulsory unless stated otherwise.
      </p>

      <div className="mt-6">
        <StudentInfoSection />
      </div>

      {paper.sections.map((section) => (
        <section key={section.id} className="mb-8 break-inside-avoid">
          <h2 className="font-display mb-4 text-center text-base font-bold uppercase tracking-wide text-paper-ink">
            Section {section.label}
          </h2>
          <h3 className="mb-1 text-center text-sm font-bold text-paper-ink">
            {section.title}
          </h3>
          <p className="mb-5 text-center text-xs italic text-paper-muted">
            {section.instruction}
          </p>
          <ol className="list-none">
            {section.questions.map((q) => (
              <QuestionItem key={q.id} question={q} />
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-8 text-center text-sm font-bold text-paper-ink">
        End of Question Paper
      </p>

      {answerKey.length > 0 && <AnswerKeySection entries={answerKey} />}
    </article>
  );
}
