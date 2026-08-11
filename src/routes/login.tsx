import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthLoadingScreen, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Kirish — INTIL" },
      { name: "description", content: "INTIL hisobingizga kiring va o'qishni davom ettiring." },
    ],
  }),
});

const schema = z.object({
  email: z.string().trim().email("Email noto'g'ri").max(255),
  password: z.string().min(1, "Parolni kiriting").max(72),
});

function LoginPage() {
  const { signIn, signInWithGoogle, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      remember: fd.get("remember") === "on",
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signIn({ ...parsed.data, remember: data.remember });
      toast.success("Xush kelibsiz!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kirish amalga oshmadi");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google orqali kirish amalga oshmadi");
      setGoogleLoading(false);
    }
  };

  if (authLoading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <AuthShell
      badge="Hisobga kirish"
      title="Xush kelibsiz"
      subtitle="INTIL hisobingizga kiring va davom ettiring."
      footer={
        <>
          Hisobingiz yo'qmi?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:text-primary">
            Ro'yxatdan o'tish
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="siz@email.com"
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Parol"
          name="password"
          type={showPw ? "text" : "password"}
          icon={<Lock className="h-4 w-4" />}
          placeholder="Parolingiz"
          error={errors.password}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-muted-foreground transition hover:text-foreground"
              aria-label={showPw ? "Parolni yashirish" : "Parolni ko'rsatish"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.04] accent-[oklch(0.6_0.2_280)]"
            />
            Meni eslab qol
          </label>
          <Link to="/forgot-password" className="font-medium text-muted-foreground hover:text-foreground">
            Parolni unutdingizmi?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="gradient-bg w-full text-primary-foreground hover:opacity-90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Kirish <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">yoki</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={googleLoading}
          onClick={onGoogleClick}
          className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.27V6.62H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.11z"/>
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"/>
              </svg>
              Google orqali kirish
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  name,
  type,
  icon,
  trailing,
  error,
  ...rest
}: {
  label: string;
  name: string;
  type: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${error ? "border-destructive/60 bg-destructive/5" : "border-white/10 bg-white/[0.03] focus-within:border-primary/50 focus-within:bg-white/[0.06]"}`}>
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          {...rest}
        />
        {trailing}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
