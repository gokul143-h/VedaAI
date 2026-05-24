'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { getTeacherName, setTeacherName } from '@/lib/teacherProfile';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(getTeacherName());
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setTeacherName(name);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="Settings" showBack backHref="/assignments" />
      <main className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
        <div className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-ink">Your name</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Used in AI replies (e.g. &quot;Certainly, Lakshya!&quot;).
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lakshya"
              className="mt-4 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-ink focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200/80"
            />
            <button type="submit" className="btn-primary mt-4 w-full">
              {saved ? 'Saved' : 'Save'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
