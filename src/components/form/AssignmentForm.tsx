'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { validateAssignmentForm, hasErrors } from '@/lib/validation';
import { getAiHealth, generateAssignmentPaper, type AiHealthStatus } from '@/lib/aiClient';
import {
  addLocalAssignment,
  getLocalAssignmentCount,
} from '@/lib/assignmentStorage';
import { savePaper } from '@/lib/paperStorage';
import { checkBackendHealth, createAssignment, getAssignment } from '@/lib/api';
import { assessmentWs } from '@/lib/websocket';
import { FileUpload } from './FileUpload';
import {
  QUESTION_TYPE_ROW_GRID,
  QuestionTypeRow,
} from './QuestionTypeRow';
import type { AssignmentFormData, GeneratedPaper, JobStatus } from '@/types';

function deriveAssignmentTitle(form: {
  file: File | null;
  dueDate: string;
  additionalInstructions: string;
}): string {
  if (form.file?.name) {
    return form.file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  }
  if (form.dueDate) {
    const d = new Date(form.dueDate);
    if (!Number.isNaN(d.getTime())) {
      return `Assignment — ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
  }
  return 'Question Paper';
}

function waitForBackendPaper(
  assignmentId: string,
  onProgress: (status: JobStatus, message: string, progress: number) => void
): Promise<GeneratedPaper> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let unsub = () => {};

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      unsub();
      assessmentWs.disconnect();
      fn();
    };

    assessmentWs.connect(assignmentId);

    unsub = assessmentWs.onMessage((data) => {
      if (data.type === 'job_progress') {
        onProgress(
          (data.status as JobStatus) || 'processing',
          String(data.message || 'Generating questions...'),
          Number(data.progress) || 0
        );
      }

      if (data.type === 'job_complete' && data.paper) {
        finish(() => resolve(data.paper as GeneratedPaper));
      }

      if (data.type === 'job_failed') {
        finish(() =>
          reject(new Error(String(data.error || 'Question generation failed')))
        );
      }
    });

    const poll = async () => {
      for (let i = 0; i < 90 && !settled; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        if (settled) return;
        try {
          const res = await getAssignment(assignmentId);
          if (res.status === 'completed' && res.paper) {
            finish(() => resolve(res.paper!));
            return;
          }
          if (res.status === 'failed') {
            finish(() => reject(new Error(res.error || 'Generation failed')));
            return;
          }
          onProgress(res.status, 'Generating questions...', res.status === 'queued' ? 10 : 50);
        } catch {
          // keep polling
        }
      }
      if (!settled) {
        finish(() => reject(new Error('Generation timed out. Check backend worker is running.')));
      }
    };

    void poll();
  });
}

async function submitViaBackend(
  payload: AssignmentFormData & { title: string },
  callbacks: {
    setStatus: (status: JobStatus, message?: string) => void;
    setProgress: (n: number) => void;
    setAssignmentId: (id: string) => void;
    setJobId: (id: string) => void;
  }
): Promise<{ id: string; paper: GeneratedPaper }> {
  callbacks.setStatus('queued', 'Creating assignment on server...');
  const { id, jobId, status } = await createAssignment(payload);
  callbacks.setAssignmentId(id);
  callbacks.setJobId(jobId);
  callbacks.setStatus(status, 'Generating questions...');
  callbacks.setProgress(10);

  const paper = await waitForBackendPaper(id, (st, msg, progress) => {
    callbacks.setStatus(st, msg);
    callbacks.setProgress(progress);
  });

  return { id, paper };
}

async function submitViaLocalAi(
  payload: AssignmentFormData & { title: string },
  health: AiHealthStatus,
  setStatus: (status: JobStatus, message?: string) => void
) {
  const modelLabel = health.useMockAi ? 'mock' : health.model;
  setStatus(
    'processing',
    payload.file
      ? `Reading ${payload.file.name} and generating with ${modelLabel}...`
      : `Generating with ${modelLabel}...`
  );
  return generateAssignmentPaper(payload);
}

export function AssignmentForm() {
  const router = useRouter();
  const [aiStatus, setAiStatus] = useState<AiHealthStatus | null>(null);
  const {
    form,
    errors,
    isSubmitting,
    setField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    setErrors,
    setSubmitting,
    setAssignmentId,
    setJobId,
    setStatus,
    setProgress,
    setPaper,
    resetForm,
  } = useAssignmentStore();

  useEffect(() => {
    resetForm();
    getAiHealth()
      .then(setAiStatus)
      .catch(() => setAiStatus(null));
  }, [resetForm]);

  const totalQuestions = form.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = form.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  async function handleSubmit() {
    const payload = {
      ...form,
      title: deriveAssignmentTitle(form),
      subject: '',
    };
    const validationErrors = validateAssignmentForm(payload);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const backendUp = await checkBackendHealth();
      let result: { id: string; paper: GeneratedPaper };

      if (backendUp) {
        result = await submitViaBackend(payload, {
          setStatus,
          setProgress,
          setAssignmentId,
          setJobId,
        });
      } else {
        let health = aiStatus;
        if (!health) {
          health = await getAiHealth();
        }
        const local = await submitViaLocalAi(payload, health, setStatus);
        result = { id: local.id, paper: local.paper };
        setAssignmentId(local.id);
      }

      setPaper(result.paper);
      setStatus('completed');
      const createdAt = new Date().toISOString();
      savePaper(result.id, {
        paper: result.paper,
        dueDate: payload.dueDate,
        title: payload.title,
        createdAt,
        teacherPrompt: payload.additionalInstructions || undefined,
        sourceFileName: payload.file?.name,
      });
      addLocalAssignment({
        id: result.id,
        title: result.paper.title || payload.title,
        subject: result.paper.subject || payload.subject || undefined,
        dueDate: payload.dueDate,
        createdAt,
        status: 'completed',
        paper: result.paper,
      });
      window.dispatchEvent(
        new CustomEvent('assignments-updated', {
          detail: { count: getLocalAssignmentCount() },
        })
      );
      resetForm();
      router.push(`/paper/${result.id}`);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Submission failed',
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="rounded-[22px] border border-zinc-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-8"
      >
        <div className="mb-8">
          <h2 className="text-lg font-bold text-ink">Assignment Details</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Basic information about your assignment.
          </p>
        </div>

        <FileUpload
          file={form.file}
          onChange={(f) => setField('file', f)}
          error={errors.file}
        />

        <div className="mt-8">
          <label
            htmlFor="dueDate"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Due Date
          </label>
          <div className="relative">
            <input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-4 pr-12 text-sm text-ink shadow-sm transition focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200/80 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
            />
          </div>
          {errors.dueDate && (
            <p className="mt-1.5 text-xs text-red-600">{errors.dueDate}</p>
          )}
        </div>

        <div className="mt-10">
          <div
            className={`${QUESTION_TYPE_ROW_GRID} mb-1 hidden border-b border-zinc-100 pb-3 sm:grid`}
          >
            <span className="text-sm font-semibold text-ink">Question Type</span>
            <span className="text-center text-xs font-medium text-ink-muted">
              No. of Questions
            </span>
            <span className="text-center text-xs font-medium text-ink-muted">
              Marks
            </span>
            <span className="sr-only">Remove</span>
          </div>

          <div>
            {form.questionTypes.map((qt, i) => (
              <QuestionTypeRow
                key={i}
                config={qt}
                index={i}
                canRemove={form.questionTypes.length > 1}
                errors={errors}
                onUpdate={updateQuestionType}
                onRemove={removeQuestionType}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestionType}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-zinc-600"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            Add Question Type
          </button>

          {errors.questionTypes && (
            <p className="mt-2 text-xs text-red-600">{errors.questionTypes}</p>
          )}

          <div className="mt-6 flex flex-col items-end gap-1 text-sm">
            <p className="text-ink-muted">
              Total Questions :{' '}
              <span className="font-bold text-ink">{totalQuestions}</span>
            </p>
            <p className="text-ink-muted">
              Total Marks :{' '}
              <span className="font-bold text-ink">{totalMarks}</span>
            </p>
          </div>
        </div>

        <div className="mt-10">
          <label
            htmlFor="additionalInstructions"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Additional Instructions
            <span className="ml-1 font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="additionalInstructions"
            value={form.additionalInstructions}
            onChange={(e) => setField('additionalInstructions', e.target.value)}
            disabled={isSubmitting}
            rows={4}
            placeholder="Add any notes for question generation, e.g. focus areas or difficulty."
            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-ink placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200/80 disabled:opacity-50"
          />
        </div>

        {errors.submit && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </div>
        )}
      </form>

      <div className="flex items-center justify-between gap-4 pb-4">
        <button
          type="button"
          onClick={() => router.push('/assignments')}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:bg-zinc-900 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating questions...
            </>
          ) : (
            <>
              Create Assignment
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
