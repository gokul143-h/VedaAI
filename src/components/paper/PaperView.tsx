'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { GenerationProgress } from '@/components/ui/GenerationProgress';
import { QuestionPaper } from '@/components/paper/QuestionPaper';
import { AISummaryBanner } from '@/components/paper/AISummaryBanner';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getLocalAssignmentCount } from '@/lib/assignmentStorage';
import {
  loadAssignmentPaper,
  paperHasQuestions,
} from '@/lib/loadAssignmentPaper';
import { exportPaperToPdf } from '@/lib/pdfExport';
import { buildAiSummaryMessage } from '@/lib/buildAiSummaryMessage';
import { getTeacherName } from '@/lib/teacherProfile';
import type { PaperDisplayMeta } from '@/lib/paperTypes';
import type { StoredPaper } from '@/lib/paperStorage';

interface PaperViewProps {
  assignmentId: string;
}

export function PaperView({ assignmentId }: PaperViewProps) {
  const router = useRouter();
  const {
    status,
    progress,
    statusMessage,
    paper,
    error,
    assignmentId: storeAssignmentId,
    setStatus,
    setPaper,
    setError,
    setAssignmentId,
  } = useAssignmentStore();

  const [paperMeta, setPaperMeta] = useState<PaperDisplayMeta | undefined>();
  const [storedContext, setStoredContext] = useState<
    Pick<StoredPaper, 'teacherPrompt' | 'sourceFileName'> | null
  >(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAssignment = useCallback(async () => {
    setLoading(true);
    setError(null);

    const stored = await loadAssignmentPaper(assignmentId);
    if (stored?.paper && paperHasQuestions(stored.paper)) {
      setAssignmentId(assignmentId);
      setPaper(stored.paper);
      setStoredContext({
        teacherPrompt: stored.teacherPrompt,
        sourceFileName: stored.sourceFileName,
      });
      setPaperMeta({
        subject: stored.paper.subject,
        durationMinutes: stored.paper.durationMinutes,
        totalMarks: stored.paper.totalMarks,
      });
      setLoading(false);
      return;
    }

    setError('Question paper not found. Please create this assignment again.');
    setStatus('failed');
    setLoading(false);
  }, [assignmentId, setPaper, setError, setStatus, setAssignmentId]);

  useEffect(() => {
    void fetchAssignment();
    window.dispatchEvent(
      new CustomEvent('assignments-updated', {
        detail: { count: getLocalAssignmentCount() },
      })
    );
  }, [assignmentId, fetchAssignment]);

  async function handleDownload() {
    if (!paper) return;
    setIsDownloading(true);
    try {
      await exportPaperToPdf(
        'question-paper',
        `${paper.title.replace(/\s+/g, '_')}_question_paper.pdf`
      );
    } catch (err) {
      console.error(err);
      alert('PDF export failed. Try print instead.');
    } finally {
      setIsDownloading(false);
    }
  }

  const showPaper = Boolean(paper && paperHasQuestions(paper));
  const isGenerating =
    storeAssignmentId === assignmentId &&
    (status === 'queued' || status === 'processing');
  const showProgress =
    loading || isGenerating || (status === 'failed' && !showPaper);

  const aiMessage = paper
    ? buildAiSummaryMessage({
        paper,
        teacherName: getTeacherName(),
        teacherPrompt: storedContext?.teacherPrompt,
        sourceFileName: storedContext?.sourceFileName,
      })
    : '';

  return (
    <DashboardShell sidebarVariant="output" hideMobileFab>
      <AppHeader
        title={paper?.title ?? 'Question Paper'}
        showBack
        backHref="/assignments"
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-zinc-50/50">
        <div className="mx-auto w-full max-w-4xl px-5 py-6 sm:px-8 sm:py-8">
          {showProgress && !showPaper && (
            <div className="mb-8">
              <GenerationProgress
                status={loading ? 'processing' : status}
                progress={
                  loading ? 40 : progress || (status === 'queued' ? 10 : 0)
                }
                message={
                  loading
                    ? 'Loading questions...'
                    : statusMessage || error || undefined
                }
                error={loading ? null : error}
              />
            </div>
          )}

          {showPaper && paper && (
            <div className="mx-auto flex max-w-[720px] flex-col gap-6">
              <AISummaryBanner
                message={aiMessage}
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
              <QuestionPaper paper={paper} meta={paperMeta} />
            </div>
          )}

          {status === 'failed' && !showPaper && !loading && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => router.push('/create')}
                className="btn-primary mt-4"
              >
                Create New Assignment
              </button>
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
