import { getLocalAssignment } from '@/lib/assignmentStorage';
import { loadPaper, savePaper, type StoredPaper } from '@/lib/paperStorage';
import { getAssignment } from '@/lib/api';
import type { GeneratedPaper, JobStatus } from '@/types';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadAssignmentPaper(
  assignmentId: string
): Promise<StoredPaper | null> {
  const stored = loadPaper(assignmentId);
  if (stored?.paper && paperHasQuestions(stored.paper)) {
    return stored;
  }

  const assignment = getLocalAssignment(assignmentId);
  if (assignment?.paper && paperHasQuestions(assignment.paper)) {
    const restored: StoredPaper = {
      paper: assignment.paper,
      dueDate: assignment.dueDate,
      title: assignment.title,
      createdAt: assignment.createdAt,
    };
    savePaper(assignmentId, restored);
    return restored;
  }

  const isBackendId = /^[a-f\d]{24}$/i.test(assignmentId);

  if (isBackendId) {
    for (let attempt = 0; attempt < 45; attempt++) {
      try {
        const res = await getAssignment(assignmentId);
        if (res.paper && paperHasQuestions(res.paper)) {
          const fromApi: StoredPaper = {
            paper: res.paper,
            dueDate: res.dueDate,
            title: res.title,
            createdAt: new Date().toISOString(),
          };
          savePaper(assignmentId, fromApi);
          return fromApi;
        }

        const pending: JobStatus[] = ['queued', 'processing'];
        if (!pending.includes(res.status)) {
          break;
        }
      } catch {
        break;
      }
      await sleep(2000);
    }
  }

  if (stored?.paper) return stored;
  if (assignment?.paper) {
    return {
      paper: assignment.paper,
      dueDate: assignment.dueDate,
      title: assignment.title,
      createdAt: assignment.createdAt,
    };
  }

  return null;
}

export function paperHasQuestions(paper: GeneratedPaper | undefined | null): boolean {
  if (!paper) return false;
  return paper.sections.some((s) => s.questions.length > 0);
}
