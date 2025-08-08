import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { config } from 'dotenv'
import * as schema from "./schema"

// Carregar variáveis de ambiente
config({ path: '.env' });

// URL do banco local
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://federal-saas_owner:npg_KbV8zHeQ6DLp@ep-dry-lake-a4isdveg-pooler.us-east-1.aws.neon.tech/federal-saas?sslmode=require";

// Verificar se a URL está definida
if (!DATABASE_URL) {
  console.error("DATABASE_URL não está definida no ambiente");
  throw new Error("DATABASE_URL não está definida");
}

// Log para debug
console.log(`Conectando ao banco de dados em: ${process.env.NODE_ENV || 'development'} mode`);


// Configurar cliente PostgreSQL
const client = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes('sslmode=require') ? 'require' : false,
  max: 10, // Conexões máximas
});

export const db = drizzle(client, { schema });
export { client as sql };

