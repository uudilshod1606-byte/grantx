import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  FileQuestion,
  ClipboardList,
  LayoutDashboard,
  Activity,
  Plus,
  Trash2,
  Pencil,
  Search,
  ShieldCheck,
  Inbox,
  ArrowLeft,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { RichEditor } from "@/components/math/RichEditor";
import { MathContent } from "@/components/math/MathContent";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import {
  ADMIN_SUBJECTS,
  SUBJECTS,
  defaultPointsFor,
  questionsRepo,
  examsRepo,
  attemptsRepo,
  isAdminEmail,
  type DtmBlock,
  type ExamKind,
  type Question,
} from "@/lib/domain";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel — INTIL" },
      { name: "description", content: "INTIL admin paneli: savol bazasi, imtihonlar va foydalanuvchilarni boshqarish." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: () => {
    // Guarded in component after persistent auth state restores.
  },
});

function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const admin = isAdminEmail(user?.email);

  return (
    <div className="relative min-h-screen text-foreground">
      <Backdrop />
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="font-semibold">INTIL Admin</span>
          </div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6">
        {!admin ? (
          <NotAdmin />
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass h-auto flex-wrap gap-1 bg-transparent p-1">
              <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Umumiy</TabsTrigger>
              <TabsTrigger value="questions"><FileQuestion className="mr-2 h-4 w-4" /> Savollar</TabsTrigger>
              <TabsTrigger value="exams"><ClipboardList className="mr-2 h-4 w-4" /> Imtihonlar</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Foydalanuvchilar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><Overview /></TabsContent>
            <TabsContent value="questions"><QuestionsTab /></TabsContent>
            <TabsContent value="exams"><ExamsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}

function NotAdmin() {
  return (
    <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-accent" />
      <h1 className="mt-3 text-xl font-semibold">Ruxsat yo'q</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu sahifa faqat administratorlar uchun. Admin panel faqat ruxsat berilgan INTIL hisobida ochiladi.
      </p>
      <Button asChild className="gradient-bg mt-5 text-primary-foreground">
        <Link to="/dashboard">Dashboard'ga qaytish</Link>
      </Button>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */

function Overview() {
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const exams = examsRepo.list();
  const attempts = attemptsRepo.list();
  const users = readUsersStorage();

  useEffect(() => {
    let cancelled = false;
    questionsRepo
      .list()
      .then((qs) => {
        if (!cancelled) setQuestionCount(qs.length);
      })
      .catch(() => {
        if (!cancelled) setQuestionCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Foydalanuvchilar", value: users.length, icon: Users },
    { label: "Imtihonlar", value: exams.length, icon: ClipboardList },
    { label: "Savollar", value: questionCount ?? "…", icon: FileQuestion },
    { label: "Faol imtihonlar", value: attempts.length, icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{c.label}</span>
              <c.icon className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 text-3xl font-bold gradient-text">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">So'nggi faollik</h2>
        {attempts.length === 0 ? (
          <EmptyBox icon={Inbox} title="Faollik yo'q" description="Foydalanuvchilar imtihon ishlay boshlagach bu yerda paydo bo'ladi." />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {attempts.slice(0, 10).map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span>{a.examTitle}</span>
                <span className="text-muted-foreground">
                  {a.percent}% · {new Date(a.finishedAt).toLocaleDateString("uz-UZ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyBox({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ----------------------------- Questions ----------------------------- */

function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | ExamKind>("all");
  const [blockFilter, setBlockFilter] = useState<"all" | DtmBlock>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  const refresh = () => {
    setLoading(true);
    questionsRepo
      .list()
      .then(setQuestions)
      .catch((err) => {
        toast.error("Savollarni yuklab bo'lmadi: " + (err instanceof Error ? err.message : String(err)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (kindFilter !== "all" && q.kind !== kindFilter) return false;
      if (blockFilter !== "all" && (q.block ?? null) !== blockFilter) return false;
      if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, search, kindFilter, blockFilter]);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Savol matni bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tur" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            <SelectItem value="dtm">DTM</SelectItem>
            <SelectItem value="milliy">Milliy Sertifikat</SelectItem>
          </SelectContent>
        </Select>
        {kindFilter === "dtm" && (
          <Select value={blockFilter} onValueChange={(v) => setBlockFilter(v as typeof blockFilter)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Blok" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha bloklar</SelectItem>
              <SelectItem value="mandatory">Majburiy blok</SelectItem>
              <SelectItem value="main1">1-asosiy blok</SelectItem>
              <SelectItem value="main2">2-asosiy blok</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Yangi savol</Button>
          </DialogTrigger>
          <QuestionFormDialog onSaved={() => { refresh(); setOpen(false); }} />
        </Dialog>
        <BulkImportDialog onImported={refresh} />
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        {editing && (
          <QuestionFormDialog
            key={editing.id}
            question={editing}
            onSaved={() => { refresh(); setEditing(null); }}
          />
        )}
      </Dialog>

      {loading ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox
          icon={FileQuestion}
          title="Savollar yo'q"
          description="Hozircha bazada savollar yo'q. Yuqoridagi tugma orqali qo'shing."
        />
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Savol</th>
                <th className="px-4 py-3">Tur</th>
                <th className="px-4 py-3">Fan</th>
                <th className="px-4 py-3">Blok</th>
                <th className="px-4 py-3">Ball</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const subjName = subjectNameFor(q.kind, q.subjectId, q.block);
                const blockLabel =
                  q.kind === "dtm"
                    ? q.block === "mandatory"
                      ? "Majburiy"
                      : q.block === "main1"
                      ? "1-asosiy"
                      : q.block === "main2"
                      ? "2-asosiy"
                      : "—"
                    : "—";
                return (
                  <tr key={q.id} className="border-t border-border">
                    <td className="max-w-md truncate px-4 py-3">
                      <div className="flex items-center gap-2">
                        {q.imageUrl && <ImagePlus className="h-3.5 w-3.5 text-accent" />}
                        <span className="truncate"><MathContent latex={q.text} inline /></span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {q.kind === "dtm" ? "DTM" : "Milliy"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{subjName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{blockLabel}</td>
                    <td className="px-4 py-3 font-semibold gradient-text">
                      {(q.points ?? defaultPointsFor(q.kind, q.block ?? null)).toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(q)}
                        aria-label="Tahrirlash"
                      >
                        <Pencil className="h-4 w-4 text-accent" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="O'chirish"
                        onClick={() => {
                          questionsRepo
                            .remove(q.id)
                            .then(() => {
                              refresh();
                              toast.success("O'chirildi");
                            })
                            .catch((err) => {
                              toast.error("O'chirishda xatolik: " + (err instanceof Error ? err.message : String(err)));
                            });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function subjectNameFor(kind: ExamKind, subjectId: string, block?: DtmBlock | null) {
  const pool =
    kind === "milliy"
      ? ADMIN_SUBJECTS.milliy
      : block === "mandatory"
      ? ADMIN_SUBJECTS.dtmMandatory
      : ADMIN_SUBJECTS.dtmMain;
  return pool.find((s) => s.id === subjectId)?.name ?? subjectId;
}

function QuestionFormDialog({
  onSaved,
  question,
}: {
  onSaved: () => void;
  question?: Question;
}) {
  const isEdit = !!question;
  const [kind, setKind] = useState<ExamKind>(question?.kind ?? "dtm");
  const [block, setBlock] = useState<DtmBlock>(question?.block ?? "mandatory");
  const subjectPool =
    kind === "milliy"
      ? ADMIN_SUBJECTS.milliy
      : block === "mandatory"
      ? ADMIN_SUBJECTS.dtmMandatory
      : ADMIN_SUBJECTS.dtmMain;
  const [subjectId, setSubjectId] = useState(question?.subjectId ?? subjectPool[0].id);
  const [text, setText] = useState(question?.text ?? "");
  const [opts, setOpts] = useState<string[]>(
    question ? [...question.options] : ["", "", "", ""],
  );
  const [questionType, setQuestionType] = useState<"yopiq" | "moslashtirish" | "ochiq">(
    question?.questionType ?? "yopiq",
  );
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(
    (question?.correctIndex as 0 | 1 | 2 | 3) ?? 0,
  );
  const [answerText, setAnswerText] = useState(question?.answerText ?? "");
  const [points, setPoints] = useState<number>(
    question?.points ?? defaultPointsFor("dtm", "mandatory"),
  );
  const [imageUrl, setImageUrl] = useState<string | undefined>(question?.imageUrl);
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // When kind/block changes, sync subject and default points.
  const onKindChange = (v: ExamKind) => {
    setKind(v);
    const pool = v === "milliy" ? ADMIN_SUBJECTS.milliy : ADMIN_SUBJECTS.dtmMandatory;
    setSubjectId(pool[0].id);
    if (v === "milliy") setPoints(1);
    else {
      setBlock("mandatory");
      setPoints(defaultPointsFor("dtm", "mandatory"));
    }
  };
  const onBlockChange = (v: DtmBlock) => {
    setBlock(v);
    const pool = v === "mandatory" ? ADMIN_SUBJECTS.dtmMandatory : ADMIN_SUBJECTS.dtmMain;
    setSubjectId(pool[0].id);
    setPoints(defaultPointsFor("dtm", v));
  };

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      toast.error("Faqat PNG, JPG yoki WEBP rasm");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan oshmasin");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!text.trim()) return toast.error("Savol matnini kiriting");
    if (questionType === "yopiq" && opts.some((o) => !o.trim())) return toast.error("Barcha variantlarni to'ldiring");
    if (questionType !== "yopiq" && !answerText.trim()) return toast.error("Javobni kiriting");
    if (!(points > 0)) return toast.error("Ball 0 dan katta bo'lsin");
    setSaving(true);
    const payload = {
      text: text.trim(),
      subjectId,
      kind,
      block: kind === "dtm" ? block : null,
      points,
      imageUrl,
     questionType,
      options: questionType === "yopiq" ? opts : [],
      correctIndex: questionType === "yopiq" ? correctIndex : undefined,
      answerText: questionType !== "yopiq" ? answerText.trim() : undefined,
      explanation: explanation.trim() || undefined,
    };
    (isEdit
      ? questionsRepo.update(question!.id, payload)
      : questionsRepo.add(payload)
    )
      .then(() => {
        toast.success(isEdit ? "Savol yangilandi" : "Savol qo'shildi");
        onSaved();
      })
      .catch((err) => {
        toast.error("Saqlashda xatolik: " + (err instanceof Error ? err.message : String(err)));
      })
      .finally(() => setSaving(false));
  };

  return (
    <DialogContent
      className="glass max-h-[90vh] overflow-y-auto border-border sm:max-w-2xl"
      onPointerDownOutside={(e) => {
        const t = e.target as HTMLElement | null;
        if (
          t &&
          (t.closest(".ML__keyboard") ||
            t.closest(".ML__virtual-keyboard") ||
            t.closest("[part='container']") ||
            t.tagName?.toLowerCase() === "math-field")
        ) {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        const t = e.target as HTMLElement | null;
        if (
          t &&
          (t.closest(".ML__keyboard") ||
            t.closest(".ML__virtual-keyboard") ||
            t.closest("[part='container']") ||
            t.tagName?.toLowerCase() === "math-field")
        ) {
          e.preventDefault();
        }
      }}
      onFocusOutside={(e) => {
        const t = e.target as HTMLElement | null;
        if (t && (t.closest(".ML__keyboard") || t.tagName?.toLowerCase() === "math-field")) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <DialogHeader className="flex-1">
          <DialogTitle>{isEdit ? "Savolni tahrirlash" : "Yangi savol qo'shish"}</DialogTitle>
        </DialogHeader>
        <Button onClick={submit} disabled={saving} className="gradient-bg text-primary-foreground">
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">Imtihon turi</label>
            <Select value={kind} onValueChange={(v) => onKindChange(v as ExamKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dtm">DTM</SelectItem>
                <SelectItem value="milliy">Milliy Sertifikat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {kind === "dtm" && (
            <div>
              <label className="text-xs text-muted-foreground">DTM blok</label>
              <Select value={block} onValueChange={(v) => onBlockChange(v as DtmBlock)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory">Majburiy blok (1.1)</SelectItem>
                  <SelectItem value="main1">1-asosiy fan (3.1)</SelectItem>
                  <SelectItem value="main2">2-asosiy fan (2.1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">Fan</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjectPool.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Ball</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Savol turi</label>
          <Select value={questionType} onValueChange={(v) => setQuestionType(v as typeof questionType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yopiq">Yopiq (A/B/C/D variantli)</SelectItem>
              <SelectItem value="moslashtirish">Moslashtirish (umumiy javob banki)</SelectItem>
              <SelectItem value="ochiq">Ochiq (yozma javob)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Savol matni</label>
          <RichEditor
            value={text}
            onChange={setText}
            placeholder="Savol matnini kiriting…"
            minHeight={140}
            ariaLabel="Savol matni"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Rasm (PNG/JPG/WEBP, ixtiyoriy)</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
            />
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Preview" className="h-24 rounded-lg border-border" />
                <button
                  type="button"
                  onClick={() => { setImageUrl(undefined); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow"
                  aria-label="Rasmni o'chirish"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="glass border-border hover:bg-muted"
              >
                <ImagePlus className="mr-2 h-4 w-4" /> Rasm yuklash
              </Button>
            )}
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                className="hover:bg-muted"
              >
                Almashtirish
              </Button>
            )}
          </div>
        </div>

       {questionType === "yopiq" ? (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Variantlar (to'g'risini belgilang)</label>
            {(["A", "B", "C", "D"] as const).map((l, i) => (
              <div key={l} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectIndex(i as 0 | 1 | 2 | 3)}
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${correctIndex === i ? "gradient-bg text-primary-foreground" : "bg-muted"}`}
                >{l}</button>
                <div className="flex-1">
                  <RichEditor
                    value={opts[i]}
                    onChange={(v) => { const n = [...opts]; n[i] = v; setOpts(n); }}
                    placeholder={`Variant ${l}`}
                    minHeight={56}
                    ariaLabel={`Variant ${l}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <label className="text-xs text-muted-foreground">
              {questionType === "moslashtirish" ? "Javob (masalan: A-F dan tanlangan javob)" : "Javob (masalan: a) 1  b) 5/4)"}
            </label>
            <RichEditor
              value={answerText}
              onChange={setAnswerText}
              placeholder="Javobni kiriting…"
              minHeight={80}
              ariaLabel="Javob"
            />
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Izoh (ixtiyoriy)</label>
          <RichEditor
            value={explanation}
            onChange={setExplanation}
            placeholder="To'g'ri javob izohi…"
            minHeight={100}
            ariaLabel="Izoh"
          />
        </div>
      </div>
    </DialogContent>
  );
}

/* ----------------------------- Exams ----------------------------- */

function ExamsTab() {
  const [exams, setExams] = useState(() => examsRepo.list());
  const [open, setOpen] = useState(false);
  const refresh = () => setExams(examsRepo.list());

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Imtihonlar</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Yangi imtihon</Button>
          </DialogTrigger>
          <ExamFormDialog onSaved={() => { refresh(); setOpen(false); }} />
        </Dialog>
      </div>
      {exams.length === 0 ? (
        <EmptyBox icon={ClipboardList} title="Imtihonlar yo'q" description="Birinchi imtihon shablonini yarating." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {exams.map((e) => (
            <div key={e.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{e.kind === "dtm" ? "DTM" : "Milliy"}</div>
                  <h3 className="mt-1 font-semibold">{e.title}</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { examsRepo.remove(e.id); refresh(); }}>
                  <Trash2 className="h-4 w-4 text-rose-400" />
                </Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {e.subjectIds.length} fan · {e.questionsPerSubject} savol/fan · {e.durationMinutes} daqiqa
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamFormDialog({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ExamKind>("dtm");
  const [duration, setDuration] = useState(180);
  const [perSubject, setPerSubject] = useState(30);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);

  const toggle = (id: string) => setSubjectIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    if (!title.trim()) return toast.error("Imtihon nomini kiriting");
    if (!subjectIds.length) return toast.error("Kamida bitta fan tanlang");
    examsRepo.add({ title: title.trim(), kind, durationMinutes: duration, questionsPerSubject: perSubject, subjectIds });
    toast.success("Imtihon yaratildi");
    onSaved();
  };

  const available = SUBJECTS.filter((s) => s.kinds.includes(kind));

  return (
    <DialogContent className="glass border-border sm:max-w-xl">
      <DialogHeader><DialogTitle>Yangi imtihon</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Imtihon nomi" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Tur</label>
            <Select value={kind} onValueChange={(v) => { setKind(v as ExamKind); setSubjectIds([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dtm">DTM</SelectItem>
                <SelectItem value="milliy">Milliy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Davomiyligi (daq)</label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Savol/fan</label>
            <Input type="number" value={perSubject} onChange={(e) => setPerSubject(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fanlar</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {available.map((s) => {
              const active = subjectIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`rounded-xl px-3 py-1.5 text-sm transition ${active ? "gradient-bg text-primary-foreground" : "glass hover:bg-muted"}`}
                >{s.name}</button>
              );
            })}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} className="gradient-bg text-primary-foreground">Yaratish</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ----------------------------- Users ----------------------------- */

function readUsersStorage(): Array<{ id: string; email: string; fullName: string; createdAt: string }> {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("intil.auth.users") ?? "[]");
  } catch {
    return [];
  }
}

function UsersTab() {
  const [search, setSearch] = useState("");
  const users = readUsersStorage();
  const attempts = attemptsRepo.list();

  const filtered = users.filter((u) =>
    !search || u.email.includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Email yoki ism..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyBox icon={Users} title="Foydalanuvchilar yo'q" description="Hozircha ro'yxatdan o'tgan foydalanuvchilar yo'q." />
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Foydalanuvchi</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Imtihonlar</th>
                <th className="px-4 py-3">Qo'shilgan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const count = attempts.filter((a) => a.userId === u.id).length;
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">{u.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
