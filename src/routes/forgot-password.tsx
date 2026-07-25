import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Parolni tiklash — INTIL" },
      { name: "description", content: "INTIL hisobingiz parolini tiklash uchun email yuboring." },
    ],
  }),
});

const schema = z.object({ email: z.string().trim().email("Email noto'g'ri").max(255) });

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: String(fd.get("email") ?? "") });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email noto'g'ri");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell
      badge="Parolni tiklash"
      title="Parolingizni unutdingizmi?"
      subtitle="Email manzilingizni kiriting — tiklash havolasini yuboramiz."
      footer={
        <Link to="/login" className="font-medium text-foreground hover:text-primary">
          ← Kirishga qaytish
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="font-semibold">Havola yuborildi</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pochtangizni tekshiring va ko'rsatmalarga amal qiling.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${error ? "border-destructive/60 bg-destructive/5" : "border-white/10 bg-white/[0.03] focus-within:border-primary/50 focus-within:bg-white/[0.06]"}`}>
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="siz@email.com"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <Button type="submit" disabled={loading} className="gradient-bg w-full text-primary-foreground hover:opacity-90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Havolani yuborish <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
