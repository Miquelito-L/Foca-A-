import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { sql } from "@/lib/neon";

interface User {
  id: string;
  name: string;
  phone: string; // Corrigido: usando 'phone' em vez de 'email'
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
        const urlParams = new URLSearchParams(window.location.search);
        const tokenDaUrl = urlParams.get("token");

        // 1. Tenta autenticar via Token da URL
        if (tokenDaUrl) {
          console.log("🔄 Validando token:", tokenDaUrl);
          const tokenValido = await sql`
            SELECT user_id FROM access_tokens 
            WHERE token = ${tokenDaUrl} 
            AND used = false 
            AND expires_at > NOW()
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
              console.log("✅ Acesso concedido via token para:", userResult[0].name);
              setUser({
                id: String(userResult[0].id),
                name: userResult[0].name,
                phone: userResult[0].phone
              });
              return;
            }
          } else {
            console.warn("⚠️ Token inválido ou expirado.");
          }
        }

        // 2. Fallback: Tenta conectar automaticamente como Usuário 1 (para testes)
        console.log("🔄 Tentando login automático (Usuário 1)...");
        const result = await sql`
            SELECT id, name, phone 
            FROM users 
            WHERE id = 1 
            LIMIT 1
        `;

        if (result && result.length > 0) {
            setUser({
                id: String(result[0].id),
                name: result[0].name,
                phone: result[0].phone
            });
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