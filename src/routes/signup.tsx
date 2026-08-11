import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, User, Lock, ArrowRight, MailCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthLoadingScreen, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Ro'yxatdan o'tish — INTIL" },
      { name: "description", content: "INTIL'da yangi hisob yarating va o'qishni boshlang." },
    ],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Ism kamida 2 ta harfdan iborat bo'lishi kerak").max(80),
  email: z.string().trim().email("Email noto'g'ri").max(255),
  password: z.string().min(8, "Parol kamida 8 ta belgi").max(72),
});

function SignUpPage() {
  const { signUp, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
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
      const { needsEmailConfirmation } = await signUp(parsed.data);
      if (needsEmailConfirmation) {
        setPendingEmail(parsed.data.email);
        toast.success("Tasdiqlash havolasi emailingizga yuborildi");
      } else {
        toast.success("Hisob yaratildi! INTIL'ga xush kelibsiz");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  if (pendingEmail) {
    return (
      <AuthShell
        badge="Deyarli tayyor"
        title="Emailingizni tasdiqlang"
        subtitle={`Biz ${pendingEmail} manziliga tasdiqlash havolasini yubordik. Havolani bosing — shundan so'ng avtomatik tarzda hisobingizga kirasiz.`}
        footer={
          <>
            Havola kelmadimi? Spam papkasini tekshiring yoki{" "}
            <button type="button" onClick={() => setPendingEmail(null)} className="font-medium text-foreground hover:text-primary">
              qaytadan urinib ko'ring
            </button>
            .
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-muted-foreground">
          <MailCheck className="h-5 w-5 text-primary" />
          Tasdiqlanmagan hisob bilan tizimga kirib bo'lmaydi.
        </div>
        <Link to="/login" className="mt-4 block text-center text-sm font-medium text-foreground hover:text-primary">
          Kirish sahifasiga o'tish
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Yangi hisob"
      title="Ro'yxatdan o'tish"
      subtitle="Bepul hisob yarating va DTM, Milliy Sertifikatga tayyorlanishni boshlang."
      footer={
        <>
          Hisobingiz bormi?{" "}
          <Link to="/login" className="font-medium text-foreground hover:text-primary">
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="To'liq ism"
          name="fullName"
          type="text"
          icon={<User className="h-4 w-4" />}
          placeholder="Ism Familiya"
          error={errors.fullName}
          autoComplete="name"
        />
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
          placeholder="Kamida 8 ta belgi"
          error={errors.password}
          autoComplete="new-password"
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

        <Button
          type="submit"
          disabled={loading}
          className="gradient-bg w-full text-primary-foreground hover:opacity-90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Hisob yaratish <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <p className="pt-1 text-center text-[11px] text-muted-foreground">
          Ro'yxatdan o'tish orqali siz Foydalanish shartlariga rozilik bildirasiz.
        </p>
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
      <div className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${error ? "border-destructive/60 bg-destructive/5" : "border-white/10 bg-white/[0.03] focus-within:border-primary/50 focus-within:bg-white/[0.06]"}`}>
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
