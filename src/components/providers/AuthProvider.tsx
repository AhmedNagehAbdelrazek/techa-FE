'use client';

import { useEffect } from 'react';
import { setTokenGetter } from '@/services/client';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().token);
  }, []);

  return <>{children}</>;
}
