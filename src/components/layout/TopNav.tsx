import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Lista de itens do menu principal (usada no header e para determinar o estado ativo)
// Cada item possui um `name` (texto exibido) e `href` (rota interna do app React Router)
const navItems = [
  { name: "Visão Geral", href: "/dashboard" },
  { name: "Finanças", href: "/dashboard/finances" },
  { name: "Saúde", href: "/dashboard/health" },
  { name: "Acadêmico", href: "/dashboard/academic" },
  { name: "Agenda", href: "/dashboard/schedule" },
];

export function TopNav() {
  // `location` é usado para saber qual rota está ativa e aplicar estilo
  const location = useLocation();
  // `useTheme` provê estado do tema (dark/light) e função para alternar
  const { theme, setTheme } = useTheme();

  return (
    // Cabeçalho fixo no topo com blur e borda inferior
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

        {/*
          Logo (lado esquerdo):
          - Imagem carregada de `public/` via path absoluto `/Logo_simbolo_branco.jpg`.
          - O container (`div`) mantém tamanho fixo `h-9 w-9` e `overflow-hidden`
            para garantir que ícones maiores não extrapolem a área.
          - O `span` ao lado é o nome textual do app; manter para SEO/legibilidade.
        */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-transparent">
            <img
              src="/Logo_simbolo_branco.jpg"
              alt="Foca.Aí"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">Foca.Aí</span>
        </Link>


        {/*
          Navegação central (aparece em telas maiores):
          - `navItems` é mapeado para links.
          - O item ativo (comparando `location.pathname`) recebe classes especiais.
          - `motion.div` do framer-motion adiciona micro-interações (hover/tap).
        */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <motion.div
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/*
          Botão de alternância de tema (lado direito):
          - `Button` com variante `ghost` contém ícones do Lucide.
          - Usa classes e transições para alternar visual entre Sun/Moon.
        */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>
    </header>
  );
}
