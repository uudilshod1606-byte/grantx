import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap,
  ArrowLeft,
  Languages,
  Calculator,
  BookText,
  Clock,
  Zap,
  Leaf,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamRunner } from "@/components/exam/ExamRunner";

const SUBJECTS: Record<string, { name: string; icon: LucideIcon }> = {
  "cefr-english": { name: "CEFR English", icon: Languages },
  matematika: { name: "Matematika", icon: Calculator },
  "ona-tili": { name: "Ona tili va adabiyot", icon: BookText },
  tarix: { name: "Tarix", icon: Clock },
  fizika: { name: "Fizika", icon: Zap },
  biologiya: { name: "Biologiya", icon: Leaf },
  kimyo: { name: "Kimyo", icon: FlaskConical },
};

export const Route = createFileRoute("/milliy-sertifikat/$subjectId")({
  component: MilliyExamPage,
  head: ({ params }) => {
    const s = SUBJECTS[params.subjectId];
    const name = s?.name ?? "Milliy Sertifikat";
    return {
      meta: [
        { title: `${name} — Milliy Sertifikat imtihoni · GrantX` },
        {
          name: "description",
          content: `${name} fanidan milliy sertifikat imtihonini real formatda topshiring.`,
        },
      ],
    };
  },
});

function MilliyExamPage() {
  const { subjectId } = Route.useParams();
  const navigate = useNavigate();
  const subject = SUBJECTS[subjectId];

  if (!subject) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Fan topilmadi</h1>
        <p className="mt-2 text-muted-foreground">
          Tanlangan fan mavjud emas.
        </p>
        <Link to="/milliy-sertifikat">
          <Button className="mt-6 gradient-bg text-primary-foreground hover:opacity-90">
            Fanlar ro'yxatiga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Grant<span className="gradient-text">X</span>
            </span>
          </Link>
          <Link to="/milliy-sertifikat">
            <Button variant="ghost" className="text-foreground hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Fanlar
            </Button>
          </Link>
        </nav>
      </header>

      <ExamRunner
        title={`Milliy Sertifikat · ${subject.name}`}
        subjects={[
          { id: subjectId, name: subject.name, icon: subject.icon, questions: 0 },
        ]}
        durationMinutes={90}
        onExit={() => navigate({ to: "/milliy-sertifikat" })}
      />
    </div>
  );
}