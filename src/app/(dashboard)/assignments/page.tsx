import { AppHeader } from '@/components/layout/AppHeader';
import { AssignmentsDashboard } from '@/components/assignments/AssignmentsDashboard';

export default function AssignmentsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="Assignment" showBack />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AssignmentsDashboard />
      </main>
    </div>
  );
}
