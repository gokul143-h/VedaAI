export interface PaperDisplayMeta {
  schoolHeading?: string;
  subject: string;
  className?: string;
  durationMinutes: number;
  totalMarks: number;
}

export interface AnswerKeyEntry {
  number: number;
  text: string;
}
