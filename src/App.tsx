import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // 1. Importei o useAuth
import ScrollToTop from "@/components/ScrollToTop";
import { LoadingSpinner } from "@/components/ui/loading-spinner"; // 2. Importei o Spinner para feedback visual

// Pages
import Dashboard from "./pages/Dashboard";
import FinancesPage from "./pages/FinancesPage";
import HealthPage from "./pages/HealthPage";
import AcademicPage from "./pages/AcademicPage";
import SchedulePage from "./pages/SchedulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente que protege rotas — aqui é simples porque o Dashboard lida
// com usuário não autenticado por conta própria. Se quiser autenticação
// mais rígida, implementar lógica de redirecionamento aqui.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Componente que engloba todas as rotas da aplicação.
// Observação importante: nós consultamos `useAuth().loading` para impedir
// que o roteamento ocorra enquanto o AuthContext ainda está validando o token.
function AppRoutes() {
  const { loading } = useAuth(); // pega o estado de verificação do AuthContext

  // Enquanto o contexto estiver validando (verificando token no DB), mostramos
  // um spinner global e NÃO renderizamos as rotas — isso evita redirecionamentos
  // prematuros que poderiam limpar a URL antes do contexto processar o token.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        <span className="ml-3 text-muted-foreground animate-pulse">Validando acesso...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota raiz redireciona para /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* /login redireciona para dashboard — o AuthContext já processa token se houver */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />

      {/* Rotas do dashboard e subpáginas */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/finances" element={<ProtectedRoute><FinancesPage /></ProtectedRoute>} />
      <Route path="/dashboard/health" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
      <Route path="/dashboard/academic" element={<ProtectedRoute><AcademicPage /></ProtectedRoute>} />
      <Route path="/dashboard/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />

      {/* Fallback para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Entrada principal do app — provê providers (tema, query client, tooltips)
// e envolve as rotas com o `AuthProvider` para que todo o app tenha acesso
// ao estado de autenticação.
const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          {/* AuthProvider envolve as rotas para fornecer `useAuth()` globalmente */}
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;