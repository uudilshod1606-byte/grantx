import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Lightweight auth context for GrantX.
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
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (input: { email: string; password: string; remember?: boolean }) => Promise<void>;
  signUp: (input: { fullName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_USER = "grantx.auth.user";
const STORAGE_USERS = "grantx.auth.users";

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredUser = AuthUser & { password: string };

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
    setUser(u);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}