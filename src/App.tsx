import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import Index from "./pages/Index";
import SpeakersPage from "./pages/Speakers";
import AgendaPage from "./pages/Agenda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Starry Background */}
          <div className="fixed inset-0 bg-black z-0">
            <StarsBackground />
            <ShootingStars />
          </div>
          <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/speakers" element={<SpeakersPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
