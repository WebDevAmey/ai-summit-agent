import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import SpeakersPage from "./pages/Speakers";
import AgendaPage from "./pages/Agenda";
import NotFound from "./pages/NotFound";

const ExploreDelhiPage = lazy(() => import("./pages/ExploreDelhi"));

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative z-[1] flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/speakers" element={<SpeakersPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route
                path="/explore-delhi"
                element={
                  <Suspense fallback={<div className="container mx-auto px-4 py-8 text-muted-foreground">Loading Delhi guide...</div>}>
                    <ExploreDelhiPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
