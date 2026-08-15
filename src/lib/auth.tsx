import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth context for INTIL — backed by Supabase Auth.
 * Security-sensitive authorization is enforced server-side with RLS; this
 * client-side role is only a UI convenience and must never be treated as a
 * security boundary.
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
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (input: { email: string; password: string; remember?: boolean }) => Promise<void>;
  signUp: (input: { fullName: string; email: string; password: string }) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

export const INTIL_ADMIN_EMAIL = "dilshoduktamov34@gmail.com";

const AuthContext = createContext<AuthContextValue | null>(null);

function adminRoleFor(email: string): AuthUser["role"] {
  return email.trim().toLowerCase() === INTIL_ADMIN_EMAIL ? "admin" : "user";
}

function mapUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const email = (u.email ?? "").trim().toLowerCase();
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = String(meta["full_name"] ?? meta["fullName"] ?? "").trim() || email.split("@")[0] || "INTIL user";
  return {
    id: u.id,
    email,
    fullName,
    createdAt: u.created_at ?? new Date().toISOString(),
    role: adminRoleFor(email),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { full_name: normalizedName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      // Keep account-existence details generic to reduce email enumeration.
      if (/already registered|already exists|user already/i.test(error.message)) {
        throw new Error("Bu email bilan hisob mavjud yoki ro'yxatdan o'tish jarayoni boshlangan. Kirishni yoki parolni tiklashni sinab ko'ring.");
      }
      throw new Error("Hisob yaratib bo'lmadi. Ma'lumotlarni tekshirib, qayta urinib ko'ring.");
    }

    return { needsEmailConfirmation: !data.session };
  };

  const signIn: AuthContextValue["signIn"] = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        throw new Error("Email hali tasdiqlanmagan. Pochtangizdagi tasdiqlash havolasini bosing.");
      }
      // Deliberately keep login failures generic so the UI does not reveal
      // whether a particular email exists.
      if (/invalid login credentials/i.test(error.message)) {
        throw new Error("Email yoki parol noto'g'ri");
      }
      throw new Error("Kirish amalga oshmadi. Qayta urinib ko'ring.");
    }
  };

  const signInWithGoogle: AuthContextValue["signInWithGoogle"] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw new Error("Google orqali kirish amalga oshmadi. Qayta urinib ko'ring.");
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error("Hisobdan chiqishda xatolik yuz berdi.");
    setSession(null);
  };

  const user = useMemo(() => mapUser(session?.user), [session]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin: adminRoleFor(user?.email ?? "") === "admin",
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }), [user, session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
