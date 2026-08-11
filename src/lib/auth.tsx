import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auth context for INTIL — backed by real Cloud (Supabase) Auth.
 * Sessions are managed by supabase-js and synced via onAuthStateChange.
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
  const fullName = String(meta['full_name'] ?? meta['fullName'] ?? "").trim() || email.split("@")[0] || "INTIL user";
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
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue["signUp"] = async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw new Error(error.message);
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
      if (/invalid login credentials/i.test(error.message)) {
        throw new Error("Email yoki parol noto'g'ri");
      }
      throw new Error(error.message);
    }
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    await supabase.auth.signOut();
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
  }), [user, session, loading]);

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