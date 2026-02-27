import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TieredAuthProvider } from "./contexts/AuthContext";
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

import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

import StorePage from "./pages/StorePage";
import TournamentsPage from "./pages/TournamentsPage";

import AboutPage from "./pages/AboutPage";
import FoundationPage from "./pages/FoundationPage";
import CyberGalaxyPage from "./pages/CyberGalaxyPage";
import TournamentRules from "./pages/TournamentRules";
import AfterSchoolProgram from "./pages/AfterSchoolProgram";
import RewardsPage from "./pages/RewardsPage";
import EsportsPage from "./pages/EsportsPage";
import DJBoothPage from "./pages/DJBoothPage";
import CyberBreakerPage from "./pages/CyberBreakerPage";
import CyberColumnsPage from "./pages/CyberColumnsPage";
import SponsorshipsPage from "./pages/SponsorshipsPage";
import WalletPage from "./pages/WalletPage";
import WelcomePromoPopup from "./components/WelcomePromoPopup";
import { CyberMusicPlayer } from "./components/CyberMusicPlayer";
import { FloatingSupportAgent } from "./components/FloatingSupportAgent";
import { RadioVisibilityProvider } from "./contexts/RadioVisibilityContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TieredAuthProvider>
        <AuthProvider>
          <CartProvider>
            <RadioVisibilityProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <WelcomePromoPopup />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/token-creator" element={<TokenCreator />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/games/cyber-match" element={<CyberMatch />} />
                  <Route path="/games/cyber-sequence" element={<CyberSequence />} />
                  
                  
                  <Route path="/cyber-galaxy" element={<CyberGalaxyPage />} />
                  
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/tournaments" element={<TournamentsPage />} />
                  
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/foundation" element={<FoundationPage />} />
                  <Route path="/tournament-rules" element={<TournamentRules />} />
                  <Route path="/after-school" element={<AfterSchoolProgram />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/esports" element={<EsportsPage />} />
                  <Route path="/dj" element={<DJBoothPage />} />
                  <Route path="/games/cyber-breaker" element={<CyberBreakerPage />} />
                  <Route path="/games/cyber-columns" element={<CyberColumnsPage />} />
                  <Route path="/sponsorships" element={<SponsorshipsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/cancel" element={<Cancel />} />
                  <Route path="*" element={<NotFound />} />
              </Routes>
                <div className="fixed bottom-4 right-4 z-40 w-80">
                  <CyberMusicPlayer />
                </div>
                <FloatingSupportAgent />
              </BrowserRouter>
            </TooltipProvider>
            </RadioVisibilityProvider>
          </CartProvider>
        </AuthProvider>
      </TieredAuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
