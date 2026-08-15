import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Shaxsiy reja — INTIL" },
      { name: "description", content: "INTIL AI siz uchun individual tayyorgarlik rejasini tuzadi." },
    ],
  }),
});

function OnboardingPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#fbf8f2]">
      <iframe
        title="INTIL — Onboarding"
        src="/intil-onboarding-loader.html"
        className="block h-full w-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
