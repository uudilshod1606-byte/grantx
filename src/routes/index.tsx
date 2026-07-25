import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthLoadingScreen, useAuth } from "@/lib/auth";
import { Hero } from "@/components/hero/Hero";
import HeroPracticeSection from "@/components/HeroPracticeSection";
import PlatformFeaturesSection from "@/components/PlatformFeaturesSection";
export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "INTIL — DTM va Milliy Sertifikatga tayyorlov" },
      { name: "description", content: "INTIL — O'zbek talabalari uchun zamonaviy ta'lim platformasi. DTM va Milliy Sertifikat imtihonlariga onlayn tayyorlanish." },
    ],
  }),
});

function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F3EEE3] text-[#241A12]">
      <Hero />
      <HeroPracticeSection />
      <PlatformFeaturesSection />
    </div>
  );
}
