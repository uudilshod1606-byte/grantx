import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  FileQuestion,
  ClipboardList,
  LayoutDashboard,
  Activity,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Inbox,
  ArrowLeft,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  SUBJECTS,
  DIFFICULTIES,
  questionsRepo,
  examsRepo,
  attemptsRepo,
  isAdminEmail,
  type Difficulty,
  type ExamKind,
  type Question,
} from "@/lib/domain";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel — GrantX" },
      { name: "description", content: "GrantX admin paneli: savol bazasi, imtihonlar va foydalanuvchilarni boshqarish." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: () => {
    // We can't read auth context in beforeLoad without router context wiring,
    // so the component re-checks and renders a gate UI if not admin.
  },
});

function AdminPage() {
  const { user } = useAuth();
  const admin = isAdminEmail(user?.email);

  if (!user) {
    throw redirect({ to: "/login" });
  }

  return (
    <div className="relative min-h-screen text-foreground">
      <Backdrop />
      <header className="glass sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="font-semibold">GrantX Admin</span>
          </div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
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
        Bu sahifa faqat administratorlar uchun. Admin huquqi olish uchun
        <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-xs">admin@grantx.uz</code>
        bilan tizimga kiring.
      </p>
      <Button asChild className="gradient-bg mt-5 text-primary-foreground">
        <Link to="/dashboard">Dashboard'ga qaytish</Link>
      </Button>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */

function Overview() {
  const questions = questionsRepo.list();
  const exams = examsRepo.list();
  const attempts = attemptsRepo.list();
  const users = readUsersStorage();

  const cards = [
    { label: "Foydalanuvchilar", value: users.length, icon: Users },
    { label: "Imtihonlar", value: exams.length, icon: ClipboardList },
    { label: "Savollar", value: questions.length, icon: FileQuestion },
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
          <ul className="divide-y divide-white/5 text-sm">
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
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ----------------------------- Questions ----------------------------- */

function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>(() => questionsRepo.list());
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const refresh = () => setQuestions(questionsRepo.list());

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (subjectFilter !== "all" && q.subjectId !== subjectFilter) return false;
      if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, search, subjectFilter]);

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
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Fan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha fanlar</SelectItem>
            {SUBJECTS.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Yangi savol</Button>
          </DialogTrigger>
          <QuestionFormDialog onSaved={() => { refresh(); setOpen(false); }} />
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <EmptyBox
          icon={FileQuestion}
          title="Savollar yo'q"
          description="Hozircha bazada savollar yo'q. Yuqoridagi tugma orqali qo'shing."
        />
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Savol</th>
                <th className="px-4 py-3">Fan</th>
                <th className="px-4 py-3">Darajasi</th>
                <th className="px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const subj = SUBJECTS.find((s) => s.id === q.subjectId);
                return (
                  <tr key={q.id} className="border-t border-white/5">
                    <td className="max-w-md truncate px-4 py-3">{q.text}</td>
                    <td className="px-4 py-3 text-muted-foreground">{subj?.name ?? q.subjectId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">
                        {DIFFICULTIES.find((d) => d.id === q.difficulty)?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { questionsRepo.remove(q.id); refresh(); toast.success("O'chirildi"); }}>
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

function QuestionFormDialog({ onSaved }: { onSaved: () => void }) {
  const [text, setText] = useState("");
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [kind, setKind] = useState<ExamKind>("dtm");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [opts, setOpts] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0);
  const [category, setCategory] = useState("");
  const [explanation, setExplanation] = useState("");

  const submit = () => {
    if (!text.trim()) return toast.error("Savol matnini kiriting");
    if (opts.some((o) => !o.trim())) return toast.error("Barcha variantlarni to'ldiring");
    questionsRepo.add({
      text: text.trim(),
      subjectId,
      kind,
      difficulty,
      category: category.trim() || undefined,
      options: opts as [string, string, string, string],
      correctIndex,
      explanation: explanation.trim() || undefined,
    });
    toast.success("Savol qo'shildi");
    onSaved();
  };

  return (
    <DialogContent className="glass max-h-[90vh] overflow-y-auto border-white/10 sm:max-w-2xl">
      <DialogHeader><DialogTitle>Yangi savol qo'shish</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Savol matni</label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Imtihon turi</label>
            <Select value={kind} onValueChange={(v) => setKind(v as ExamKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dtm">DTM</SelectItem>
                <SelectItem value="milliy">Milliy Sertifikat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fan</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.filter((s) => s.kinds.includes(kind)).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Darajasi</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Kategoriya (ixtiyoriy)</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Mavzu" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Variantlar (to'g'risini belgilang)</label>
          {(["A", "B", "C", "D"] as const).map((l, i) => (
            <div key={l} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i as 0 | 1 | 2 | 3)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${correctIndex === i ? "gradient-bg text-primary-foreground" : "bg-white/5"}`}
              >{l}</button>
              <Input value={opts[i]} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n); }} placeholder={`Variant ${l}`} />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Izoh (ixtiyoriy)</label>
          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} className="gradient-bg text-primary-foreground">Saqlash</Button>
      </DialogFooter>
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
    <DialogContent className="glass border-white/10 sm:max-w-xl">
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
                  className={`rounded-xl px-3 py-1.5 text-sm transition ${active ? "gradient-bg text-primary-foreground" : "glass hover:bg-white/10"}`}
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
    return JSON.parse(localStorage.getItem("grantx.auth.users") ?? "[]");
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
            <thead className="bg-white/5 text-left text-xs uppercase text-muted-foreground">
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
                  <tr key={u.id} className="border-t border-white/5">
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