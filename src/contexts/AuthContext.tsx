// src/contexts/AuthContext.tsx
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
  
  // Função auxiliar para achar o token onde quer que ele esteja
  const getTokenFromUrl = () => {
    // 1. Tenta pegar da URL padrão (ex: site.com/?token=123)
    const searchParams = new URLSearchParams(window.location.search);
    const tokenSearch = searchParams.get("token");
    if (tokenSearch) return tokenSearch;

    // 2. Tenta pegar da Hash URL (ex: site.com/#/?token=123 ou site.com/#/login?token=123)
    // O React Router as vezes joga os params para depois da cerquilha (#)
    if (window.location.hash.includes('?')) {
        const hashString = window.location.hash.split('?')[1]; // Pega tudo depois da ?
        const hashParams = new URLSearchParams(hashString);
        return hashParams.get("token");
    }

    return null;
  };

  useEffect(() => {
    async function validarAcesso() {
      try {
        setLoading(true);
        
        // Debug: Vamos ver exatamente o que o navegador está vendo
        console.log("📍 URL Atual Completa:", window.location.href);

        const tokenDaUrl = getTokenFromUrl();

        if (tokenDaUrl) {
          console.log("🔄 Validando token encontrado:", tokenDaUrl);

          // Verifica no banco se o token existe e é válido
          const tokenValido = await sql`
            SELECT user_id FROM access_tokens 
            WHERE token = ${tokenDaUrl} 
            AND used = false 
            AND expires_at > NOW() -- Se der erro, verifique o Fuso Horário
            LIMIT 1
          `;

          if (tokenValido && tokenValido.length > 0) {
            const userId = tokenValido[0].user_id;
            
            const userResult = await sql`
              SELECT id, name, phone 
              FROM users 
              WHERE id = ${userId} 
              LIMIT 1
            `;

            if (userResult.length > 0) {
              console.log("✅ Acesso liberado para:", userResult[0].name);
              setUser({
                id: String(userResult[0].id),
                name: userResult[0].name,
                phone: userResult[0].phone
              });
            } else {
              console.error("❌ Token válido, mas usuário não encontrado.");
            }
          } else {
            console.warn("⚠️ Token inválido, expirado ou inexistente no banco.");
          }
        } else {
          console.log("ℹ️ Nenhum token encontrado na URL.");
          // Se chegou aqui, o user permanece null (Sessão Expirada)
        }

      } catch (error) {
        console.error("❌ Erro na autenticação:", error);
        setUser(null);
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