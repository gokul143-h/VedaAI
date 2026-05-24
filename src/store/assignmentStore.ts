import { create } from 'zustand';
import { DEFAULT_QUESTION_TYPE_ROWS } from '@/lib/questionTypes';
import type {
  AssignmentFormData,
  AssignmentResponse,
  FormErrors,
  GeneratedPaper,
  JobStatus,
  QuestionType,
  QuestionTypeConfig,
} from '@/types';

function defaultQuestionTypes(): QuestionTypeConfig[] {
  return DEFAULT_QUESTION_TYPE_ROWS.map((row) => ({ ...row }));
}

interface AssignmentState {
  form: AssignmentFormData;
  errors: FormErrors;
  assignmentId: string | null;
  jobId: string | null;
  status: JobStatus;
  progress: number;
  statusMessage: string;
  paper: GeneratedPaper | null;
  error: string | null;
  isSubmitting: boolean;

  setField: <K extends keyof AssignmentFormData>(
    key: K,
    value: AssignmentFormData[K]
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (
    index: number,
    field: keyof QuestionTypeConfig,
    value: QuestionType | number
  ) => void;
  setErrors: (errors: FormErrors) => void;
  resetForm: () => void;

  setAssignmentId: (id: string) => void;
  setJobId: (id: string) => void;
  setStatus: (status: JobStatus, message?: string) => void;
  setProgress: (progress: number) => void;
  setPaper: (paper: GeneratedPaper | null) => void;
  setError: (error: string | null) => void;
  setSubmitting: (v: boolean) => void;
  hydrateFromResponse: (res: AssignmentResponse) => void;
}

const initialForm: AssignmentFormData = {
  title: '',
  subject: '',
  dueDate: '',
  questionTypes: defaultQuestionTypes(),
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentState>((set) => ({
  form: { ...initialForm },
  errors: {},
  assignmentId: null,
  jobId: null,
  status: 'idle',
  progress: 0,
  statusMessage: '',
  paper: null,
  error: null,
  isSubmitting: false,

  setField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value }, errors: {} })),

  addQuestionType: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [
          ...s.form.questionTypes,
          { type: 'multiple_choice', count: 1, marksPerQuestion: 1 },
        ],
      },
    })),

  removeQuestionType: (index) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.filter((_, i) => i !== index),
      },
    })),

  updateQuestionType: (index, field, value) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((qt, i) =>
          i === index ? { ...qt, [field]: value } : qt
        ),
      },
    })),

  setErrors: (errors) => set({ errors }),
  resetForm: () =>
    set({
      form: {
        ...initialForm,
        questionTypes: defaultQuestionTypes(),
      },
      errors: {},
      assignmentId: null,
      jobId: null,
      status: 'idle',
      progress: 0,
      statusMessage: '',
      paper: null,
      error: null,
      isSubmitting: false,
    }),

  setAssignmentId: (id) => set({ assignmentId: id }),
  setJobId: (id) => set({ jobId: id }),
  setStatus: (status, message = '') =>
    set({ status, statusMessage: message }),
  setProgress: (progress) => set({ progress }),
  setPaper: (paper) =>
    set(
      paper
        ? { paper, status: 'completed', progress: 100 }
        : { paper: null, progress: 0 }
    ),
  setError: (error) => set({ error, status: error ? 'failed' : 'idle' }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  hydrateFromResponse: (res) =>
    set({
      assignmentId: res.id,
      status: res.status,
      paper: res.paper ?? null,
      error: res.error ?? null,
      progress: res.status === 'completed' ? 100 : 0,
    }),
}));
