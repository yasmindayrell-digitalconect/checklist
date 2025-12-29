"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppUser } from "@/types/auth";
import { loadUser, saveUser, clearUser } from "@/lib/authStorage";

type AuthContextValue = {
  user: AppUser | null;
  setUser: (u: AppUser) => void;
  logout: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUserState(loadUser());
    setIsReady(true);
  }, []);

  function setUser(u: AppUser) {
    setUserState(u);
    saveUser(u);
  }

  function logout() {
    setUserState(null);
    clearUser();
  }

  const value = useMemo(() => ({ user, setUser, logout, isReady }), [user, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
