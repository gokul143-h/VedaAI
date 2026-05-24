'use client';

import { useEffect, useState } from 'react';

/** True after mount — use to skip SSR for nodes altered by browser extensions. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
