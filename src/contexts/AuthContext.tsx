// Contexto de autenticação global da aplicação.
// Responsável por:
// - Detectar token de acesso (URL / localStorage) ao montar a app
// - Validar o token no banco via `sql` (neon)
// - Preencher `user` e controlar `loading` enquanto a verificação ocorre
// - Expor `signIn` e `signOut` (implementações mínimas/placeholder)
import { createContext, useContext, ReactNode, useEffect, useState, useRef } from "react";
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

  // Captura imediata do token quando o provider monta.
  // Explicação: usamos useState com função inicial para ler `window.location.search`
  // apenas na primeira renderização — isso evita perder o token caso haja
  // redirects que limpem a query string antes do efeito rodar.
  const [initialToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    // Se achou token, salva no localStorage como backup de emergência
    if (token) {
        window.localStorage.setItem("auth_token_temp", token);
        return token;
    }
    return null;
  });

  useEffect(() => {
    // Função principal que valida o acesso do usuário
    // Fluxo resumido:
    // 1) Pega token da inicialização (`initialToken`) ou da URL atual
    // 2) Se não achar, tenta recuperar do localStorage (backup)
    // 3) Consulta `access_tokens` para checar validade/uso/expiração
    // 4) Se válido, carrega usuário em `users` e popula `user` no estado
    async function validarAcesso() {
      try {
        setLoading(true);

        // Prioridade: 1. Token capturado na entrada | 2. Token da URL atual | 3. Token salvo no storage
        let tokenParaValidar = initialToken;

        if (!tokenParaValidar) {
            const params = new URLSearchParams(window.location.search);
            tokenParaValidar = params.get("token");
        }
        
        // Recupera do storage se perdemos da URL (ex: refresh ou redirect agressivo)
        if (!tokenParaValidar) {
            tokenParaValidar = window.localStorage.getItem("auth_token_temp");
        }

        if (tokenParaValidar) {
          console.log("🔒 Token detectado:", tokenParaValidar);

          // Verificação no banco: token não usado e com expires_at no futuro
          const tokenValido = await sql`
            SELECT user_id FROM access_tokens 
            WHERE token = ${tokenParaValidar} 
            AND used = false 
            AND expires_at > NOW() -- Se falhar, verifique o fuso horário UTC do banco
            LIMIT 1
          `;

          if (tokenValido && tokenValido.length > 0) {
            const userId = tokenValido[0].user_id;
            // Busca os dados essenciais do usuário na tabela `users`
            const userResult = await sql`SELECT id, name, phone FROM users WHERE id = ${userId} LIMIT 1`;

            if (userResult.length > 0) {
              // Preenche o estado global com o usuário autenticado
              console.log("✅ Usuário autenticado:", userResult[0].name);
              setUser({
                id: String(userResult[0].id),
                name: userResult[0].name,
                phone: userResult[0].phone
              });
              // Limpa o token temporário pois já foi processado com sucesso
              window.localStorage.removeItem("auth_token_temp");
            }
          } else {
            // Token inválido/expirado ou já usado
            console.warn("⚠️ Token inválido ou expirado.");
            window.localStorage.removeItem("auth_token_temp");
          }
        } else {
          // Não há token em lugar nenhum — usuário não autenticado
          console.log("ℹ️ Nenhum token para processar.");
        }

      } catch (error) {
        // Em caso de erro de rede/DB, logamos para facilitar debug
        console.error("❌ Erro Auth:", error);
      } finally {
        setLoading(false);
      }
    }

    validarAcesso();
  }, [initialToken]);

  const signIn = async () => {};
  const signOut = () => { 
      setUser(null); 
      window.localStorage.removeItem("auth_token_temp");
      // Opcional: Redirecionar para login
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}