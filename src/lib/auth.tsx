import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";

/**
 * Lightweight auth context for INTIL.
 *
 * Persistence is currently localStorage-backed so we can ship the full UX now.
 * The shape matches what we'll need when wiring Supabase later — just swap the
 * three async methods (signIn / signUp / signOut) to call supabase.auth.* and
 * replace the storage with onAuthStateChange.
 */

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  role: "admin" | "user";
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (input: { email: string; password: string; remember?: boolean }) => Promise<void>;
  signUp: (input: { fullName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => void;
};

const STORAGE_USER = "grantx.auth.user";
const STORAGE_USERS = "grantx.auth.users";
export const INTIL_ADMIN_EMAIL = "dilshoduktamov34@gmail.com";

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredUser = AuthUser & { password: string };

function adminRoleFor(email: string): AuthUser["role"] {
  return email.trim().toLowerCase() === INTIL_ADMIN_EMAIL ? "admin" : "user";
}

function normalizeUser<T extends Partial<AuthUser> & { email?: string }>(raw: T): T & AuthUser {
  const email = String(raw.email ?? "").trim().toLowerCase();
  const fullName = String(raw.fullName ?? email.split("@")[0] ?? "INTIL user").trim();
  return {
    ...raw,
    id: String(raw.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`)),
    email,
    fullName,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    role: adminRoleFor(email),
  } as T & AuthUser;
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_USERS) ?? "[]") as Array<Partial<StoredUser>>;
    return parsed
      .filter((u) => u.email && u.password)
      .map((u) => normalizeUser(u) as StoredUser);
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users.map((u) => normalizeUser(u))));
}

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    const session = normalizeUser(JSON.parse(raw) as Partial<AuthUser>);
    localStorage.setItem(STORAGE_USER, JSON.stringify(session));
    return session;
  } catch {
    localStorage.removeItem(STORAGE_USER);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(() => {
    setUser(readSession());
    setLoading(false);
  }, []);

  useEffect(() => {
    restoreSession();
    const syncSession = (event: StorageEvent) => {
      if (event.key === STORAGE_USER || event.key === STORAGE_USERS) restoreSession();
    };
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [restoreSession]);

  const persist = (u: AuthUser | null) => {
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(normalizeUser(u)));
    else localStorage.removeItem(STORAGE_USER);
    setUser(u ? normalizeUser(u) : null);
  };

  const signUp: AuthContextValue["signUp"] = async ({ fullName, email, password }) => {
    await new Promise((r) => setTimeout(r, 500));
    const users = readUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: normalized,
      fullName: fullName.trim(),
      createdAt: new Date().toISOString(),
      role: adminRoleFor(normalized),
      password,
    };
    writeUsers([...users, newUser]);
    const { password: _pw, ...publicUser } = newUser;
    persist(publicUser);
  };

  const signIn: AuthContextValue["signIn"] = async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 500));
    const normalized = email.trim().toLowerCase();
    const found = readUsers().find((u) => u.email === normalized);
    if (!found || found.password !== password) {
      throw new Error("Email yoki parol noto'g'ri");
    }
    const { password: _pw, ...publicUser } = found;
    persist(publicUser);
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    persist(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || adminRoleFor(user?.email ?? "") === "admin",
    signIn,
    signUp,
    signOut,
    restoreSession,
  }), [user, loading, restoreSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-muted-foreground">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        Sessiya tekshirilmoqda...
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}