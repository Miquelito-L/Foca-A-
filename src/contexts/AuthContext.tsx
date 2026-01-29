import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { sql } from "@/lib/neon";

interface User {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function validarAcesso() {
      try {
        setLoading(true);
        // Pega o token da URL atual (independente da rota que você esteja)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenDaUrl = urlParams.get("token");

        if (tokenDaUrl) {
          console.log("🔄 Validando token recebido:", tokenDaUrl);

          // Verifica no banco se o token existe, não foi usado e ainda é válido (data)
          // Atenção: O NOW() do banco geralmente é UTC (fuso 0). 
          const tokenValido = await sql`
            SELECT user_id FROM access_tokens 
            WHERE token = ${tokenDaUrl} 
            AND used = false 
            AND expires_at > NOW()
            LIMIT 1
          `;

          if (tokenValido && tokenValido.length > 0) {
            const userId = tokenValido[0].user_id;
            console.log("✅ Token válido! Buscando usuário ID:", userId);

            const userResult = await sql`
              SELECT id, name, phone 
              FROM users 
              WHERE id = ${userId} 
              LIMIT 1
            `;

            if (userResult.length > 0) {
              console.log("👤 Usuário autenticado:", userResult[0].name);
              setUser({
                id: String(userResult[0].id),
                name: userResult[0].name,
                phone: userResult[0].phone
              });
              
              // Opcional: Se quiser limpar o token da URL para ficar "bonito"
              // window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.error("❌ Erro crítico: Token válido, mas usuário não encontrado no banco.");
            }
          } else {
            console.warn("⚠️ Acesso negado: Token inválido, expirado ou já utilizado.");
            console.log("Dica: Verifique se o 'expires_at' no banco não está no passado devido ao Fuso Horário.");
          }
        } else {
          console.log("ℹ️ Nenhum token encontrado na URL.");
        }

      } catch (error) {
        console.error("❌ Erro na autenticação:", error);
      } finally {
        setLoading(false);
      }
    }

    validarAcesso();
  }, []);

  const signIn = async () => {};
  const signOut = () => { setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}