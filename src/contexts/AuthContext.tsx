import { createContext, useContext, ReactNode } from "react";

// Definimos o formato do nosso usuário
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // CONFIGURAÇÃO DE ACESSO DIRETO
  // Baseado na sua imagem, a maioria dos dados está no user_id "1"
  const user: User = {
    id: "1", 
    name: "Admin",
    email: "admin@foca.ai"
  };

  const signIn = async () => {};
  const signOut = () => {};

  return (
    <AuthContext.Provider value={{ user, loading: false, signIn, signOut }}>
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