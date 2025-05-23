// scripts/init-db.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Garante que as SUPABASE_ vars sejam carregadas

// Ajuste o caminho se necessário
import { initDatabase } from "../lib/db";

async function main() {
  try {
    console.log("Iniciando inicialização do banco de dados Supabase...");
    // Verifique se as variáveis do Supabase estão carregadas
    console.log("SUPABASE_URL no script:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_SERVICE_KEY no script:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Carregada" : "NÃO CARREGADA");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("ERRO: Variáveis de ambiente do Supabase não definidas no script init-db.ts.");
        process.exit(1);
    }

    await initDatabase(); // Chama a nova função que (tentará) executar DDL
    console.log("Inicialização do banco de dados Supabase solicitada (verifique o dashboard).");
    process.exit(0);
  } catch (error) {
    console.error("Falha ao solicitar inicialização do banco de dados Supabase:", error);
    process.exit(1);
  }
}

main();