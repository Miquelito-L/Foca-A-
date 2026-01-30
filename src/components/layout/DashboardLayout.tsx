import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Layout principal do Dashboard
// - Envolve as páginas do /dashboard com a navegação superior e inferior (mobile)
// - Mantém o fundo e padding consistentes para as páginas internas
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation: cabeçalho fixo com logo, navegação e controle de tema */}
      <TopNav />

      {/* Mobile Bottom Navigation: aparece apenas em telas pequenas (md:hidden no TopNav) */}
      <MobileBottomNav />

      {/* Main Content: espaço principal onde as páginas são renderizadas
          - `pb-20` garante espaço para o bottom nav no mobile
          - o `max-w-7xl` centraliza o conteúdo e define largura máxima
      */}
      <main className="pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
