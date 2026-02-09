import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./contexts/CartContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import { ScrollToTop } from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import TokenCreator from "./pages/TokenCreator";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import CyberMatch from "./pages/CyberMatch";
import CyberSequence from "./pages/CyberSequence";
import CyberTrivia from "./pages/CyberTrivia";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import CyberDropPage from "./pages/CyberDropPage";
import CyberChestPage from "./pages/CyberChestPage";
import StorePage from "./pages/StorePage";
import TournamentsPage from "./pages/TournamentsPage";
import RafflesPage from "./pages/RafflesPage";
import AboutPage from "./pages/AboutPage";
import FoundationPage from "./pages/FoundationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/token-creator" element={<TokenCreator />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/games/cyber-match" element={<CyberMatch />} />
                <Route path="/games/cyber-sequence" element={<CyberSequence />} />
                <Route path="/games/cyber-trivia" element={<CyberTrivia />} />
                <Route path="/cyber-drop" element={<CyberDropPage />} />
                <Route path="/cyber-chest" element={<CyberChestPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/tournaments" element={<TournamentsPage />} />
                <Route path="/raffles" element={<RafflesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/foundation" element={<FoundationPage />} />
                <Route path="/success" element={<Success />} />
                <Route path="/cancel" element={<Cancel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
