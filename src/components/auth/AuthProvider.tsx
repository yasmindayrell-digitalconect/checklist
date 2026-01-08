//components\auth\AuthProvider.tsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { AppUser } from "@/types/auth";

type AuthContextValue = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
