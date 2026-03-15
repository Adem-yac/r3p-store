import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageViewTracker from "@/components/PageViewTracker";
import { I18nProvider } from "@/i18n";
import Index from "./pages/Index.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import BoutiquePage from "./pages/BoutiquePage.tsx";
import CollectionsPage from "./pages/CollectionsPage.tsx";
import OrderPage from "./pages/OrderPage.tsx";
import AdminLoginPage from "./pages/AdminLoginPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <I18nProvider>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/broduit" element={<BoutiquePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/commander" element={<OrderPage />} />
            <Route path="/r3padmin/login" element={<AdminLoginPage />} />
            <Route path="/r3padmin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </I18nProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
