'use client';

import { useParams } from 'next/navigation';
import { PaperView } from '@/components/paper/PaperView';

export default function PaperPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) {
    return null;
  }

  return <PaperView assignmentId={id} />;
}
