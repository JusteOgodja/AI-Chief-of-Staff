import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import AgentInterface from "./pages/AgentInterface";
import WhatChanged from "./pages/WhatChanged";
import Conflicts from "./pages/Conflicts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function LightModeInit() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LightModeInit />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          <Route path="/agent" element={<AgentInterface />} />
          <Route path="/changes" element={<WhatChanged />} />
          <Route path="/conflicts" element={<Conflicts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
