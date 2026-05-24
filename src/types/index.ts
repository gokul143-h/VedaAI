export type QuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_blank';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'idle';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  file: File | null;
}

export interface GeneratedQuestion {
  id: string;
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
  options?: string[];
}

export interface GeneratedSection {
  id: string;
  label: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export type PaperDisplayStyle = 'chat' | 'exam';

export interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  sections: GeneratedSection[];
  generatedAt: string;
  /** Clean question list (from upload) vs formal exam layout */
  displayStyle?: PaperDisplayStyle;
}

export interface AssignmentListItem {
  id: string;
  title: string;
  subject?: string;
  dueDate: string;
  status: JobStatus;
  createdAt: string;
  /** Cached copy so card click always opens questions */
  paper?: GeneratedPaper;
}

export interface AssignmentResponse {
  id: string;
  title: string;
  subject?: string;
  dueDate: string;
  status: JobStatus;
  jobId?: string;
  paper?: GeneratedPaper;
  error?: string;
}

export interface FormErrors {
  title?: string;
  dueDate?: string;
  questionTypes?: string;
  [key: string]: string | undefined;
}
