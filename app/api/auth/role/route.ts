import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import logger from "@/lib/logger";

// Cache for role lookups to reduce database hits
const roleCache = new Map<string, { role: string; email: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Endpoint dedicated to role verification for NextAuth users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn("Unauthorized access attempt to role endpoint", {
        context: "api/auth/role",
        source: "backend"
      });
      return NextResponse.json({ 
        authorized: false, 
        role: null, 
        error: "Não autenticado" 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check cache first to reduce database load
    const cached = roleCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logger.debug(`Role cache hit for user: ${userId}`, {
        context: "api/auth/role",
        source: "backend",
        data: { role: cached.role, cached: true }
      });
      
      return NextResponse.json({
        authorized: true,
        role: cached.role,
        email: cached.email,
        source: "cache",
        userId
      });
    }
    
    logger.info(`Checking role for user: ${userId}`, {
      context: "api/auth/role",
      source: "backend"
    });
    
    // Fetch user role directly from database
    const dbUser = await db.select({
      id: users.id,
      role: users.role,
      email: users.email
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    // If found in database, use that role
    if (dbUser.length > 0) {
      const user = dbUser[0];
      
      // Cache the result
      roleCache.set(userId, {
        role: user.role || 'VIEWER',
        email: user.email,
        timestamp: Date.now()
      });
      
      logger.info(`Role verified for user ${userId}: ${user.role}`, {
        context: "api/auth/role",
        source: "backend",
        data: { 
          role: user.role,
          email: user.email
        }
      });
      
      return NextResponse.json({
        authorized: true,
        role: user.role || 'VIEWER',
        email: user.email,
        source: "database",
        userId
      });
    }
    
    // If user not found in database, return unauthorized
    return NextResponse.json({ 
      authorized: false, 
      role: null, 
      error: "Usuário não encontrado no banco de dados" 
    }, { status: 404 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    logger.error(`Erro ao verificar role: ${errorMessage}`, {
      context: "api/auth/role",
      source: "backend"
    });
    
    return NextResponse.json({ 
      authorized: false, 
      role: null, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  roleCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      roleCache.delete(key);
    }
  });
}, CACHE_DURATION); 