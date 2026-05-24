import type { AssignmentFormData, FormErrors } from '@/types';

export function validateAssignmentForm(
  data: AssignmentFormData
): FormErrors {
  const errors: FormErrors = {};

  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const due = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) {
      errors.dueDate = 'Due date cannot be in the past';
    }
  }

  if (!data.questionTypes.length) {
    errors.questionTypes = 'Add at least one question type';
  }

  data.questionTypes.forEach((qt, i) => {
    if (qt.count < 1) {
      errors[`questionTypes.${i}.count`] = 'Count must be at least 1';
    }
    if (qt.marksPerQuestion < 1) {
      errors[`questionTypes.${i}.marks`] = 'Marks must be at least 1';
    }
  });

  if (data.file) {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    const ext = data.file.name.toLowerCase();
    if (
      !allowed.includes(data.file.type) &&
      !ext.endsWith('.pdf') &&
      !ext.endsWith('.jpg') &&
      !ext.endsWith('.jpeg') &&
      !ext.endsWith('.png')
    ) {
      errors.file = 'Only JPEG, PNG, or PDF files are allowed';
    }
    if (data.file.size > 10 * 1024 * 1024) {
      errors.file = 'File must be under 10MB';
    }
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
