import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { getAppOwner } from "@/lib/storage";
import GamePage from "./pages/GamePage";
import HistoryPage from "./pages/HistoryPage";
import SessionDetailsPage from "./pages/SessionDetailsPage";
import StatsPage from "./pages/StatsPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";
import RulesPage from "./pages/RulesPage";
import SettingsPage from "./pages/SettingsPage";
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // Apply dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Check onboarding status
  useEffect(() => {
    getAppOwner().then((owner) => {
      setOnboarded(owner?.onboardingComplete ?? false);
    });
  }, []);

  // Loading state
  if (onboarded === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!onboarded) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <WelcomePage onComplete={() => setOnboarded(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="min-h-screen bg-background pb-20">
            <Routes>
              <Route path="/" element={<StatsPage />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<SessionDetailsPage />} />
              <Route path="/stats/:id" element={<PlayerStatsPage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
