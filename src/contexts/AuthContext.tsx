import { createContext, useContext, useState, ReactNode } from "react";

// Definimos tipos simples para não depender da biblioteca do Supabase
interface User {
  id: string;
  email?: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TRUQUE: Loading é sempre false. O site nunca vai esperar.
  const [loading] = useState(false);
  
  // Opcional: Criamos um usuário "falso" para o site achar que estamos logados.
  // Se preferir entrar como visitante, pode deixar user como null.
  const [user] = useState<User | null>({ 
    id: "usuario-local", 
    email: "admin@foca-a.com" 
  });
  
  const [session] = useState<Session | null>({ 
    user: { id: "usuario-local", email: "admin@foca-a.com" } 
  });

  // Funções vazias (Mock) para não quebrar o resto do site
  const signUp = async () => ({ error: null });
  const signIn = async () => ({ error: null });
  const signOut = async () => {};

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}