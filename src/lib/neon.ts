import { neon } from '@neondatabase/serverless';

// Na Vercel, configuraremos como VITE_DATABASE_URL para o frontend ter acesso
const connectionString = import.meta.env.VITE_DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO: VITE_DATABASE_URL não configurada nas variáveis de ambiente.");
}

export const sql = neon(connectionString || "");