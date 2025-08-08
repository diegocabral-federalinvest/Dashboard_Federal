import { Hono } from "hono";
import { handle } from "hono/vercel";

// AVISO: Este arquivo é legado e será completamente removido após a migração para o App Router.
// As novas APIs estão em /app/api/{recurso}/route.ts e são acessadas via fetch().

// Importamos apenas o que existe ainda - accounts é o único que permanece por enquanto

// import categories from "./categories"; 
// import transactions from "./transactions";
import apiLoggerMiddleware from "@/lib/api-logger-middleware";
import logger from "@/lib/logger";

export const runtime = "edge";

// Initialize the Hono app
const app = new Hono().basePath("/api");

// Apply global middleware
app.use("*", apiLoggerMiddleware);

// Log app startup
logger.info("API Server initialized", { 
  source: 'backend',
  context: 'server',
  tags: ['startup', 'legacy-api']
});

// Global error handling
app.onError((err, c) => {
  logger.critical("Unhandled API Error", {
    source: 'backend',
    context: 'error-handler',
    data: {
      error: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack
      } : String(err),
      url: c.req.url,
      method: c.req.method
    }
  });
  
  return c.json({
    error: "An unexpected error occurred",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  }, 500);
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;