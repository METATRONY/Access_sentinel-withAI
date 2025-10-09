import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FreeSignup from "./pages/FreeSignup";
import PremiumTrial from "./pages/PremiumTrial";
import EnterpriseContact from "./pages/EnterpriseContact";
import ExtensionInstall from "./pages/ExtensionInstall";
import Features from "./pages/Features";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup/free" element={<FreeSignup />} />
            <Route path="/signup/premium" element={<PremiumTrial />} />
            <Route path="/enterprise/contact" element={<EnterpriseContact />} />
            <Route path="/extension/install" element={<ExtensionInstall />} />
            <Route path="/features" element={<Features />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
