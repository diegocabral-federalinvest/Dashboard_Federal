// Constantes hardcoded para desenvolvimento
export const AUTH_CONFIG = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fpSdDM+9wScCSfqNECLNcQ193UpIInrFT4fgIZWfb9E=",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://federal-saas_owner:npg_KbV8zHeQ6DLp@ep-dry-lake-a4isdveg-pooler.us-east-1.aws.neon.tech/federal-saas?sslmode=require",
  NODE_ENV: process.env.NODE_ENV || "development"
};