'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Ctx = {
  kickMode: boolean;
  setKickMode: (v: boolean) => void;
};

const HostAdminContext = createContext<Ctx | null>(null);

export function HostAdminProvider({ children }: { children: ReactNode }) {
  const [kickMode, setKickMode] = useState(false);
  const value = useMemo(() => ({ kickMode, setKickMode }), [kickMode]);
  return <HostAdminContext.Provider value={value}>{children}</HostAdminContext.Provider>;
}

/**
 * Returns the host's KICK MODE state. Safe to call from anywhere — when
 * the provider is missing (e.g. on the player view), kickMode stays false.
 */
export function useHostAdmin(): Ctx {
  const ctx = useContext(HostAdminContext);
  if (!ctx) return { kickMode: false, setKickMode: () => {} };
  return ctx;
}
