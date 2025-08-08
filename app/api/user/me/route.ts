import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { authOptions } from "@/lib/auth-config";
import { eq } from "drizzle-orm";
import logger from "@/lib/logger";
import { createId } from "@paralleldrive/cuid2";

export async function GET() {
  try {
    // Get the current session from NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch user information from the database
    const dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (dbUser.length > 0) {
      logger.info(`Informações do usuário obtidas com sucesso do banco: ${dbUser[0].email}`, {
        context: "api/user/me",
        data: { userId, role: dbUser[0].role }
      });
      
      // Remove sensitive data
      const { hashedPassword, ...userWithoutPassword } = dbUser[0];
      
      return NextResponse.json({
        ...userWithoutPassword,
        source: "database"
      });
    }
    
    // If user is authenticated via NextAuth but not in our database yet
    // This could happen with OAuth providers
    if (session.user.email) {
      logger.info(`Criando novo usuário no banco: ${session.user.email}`, {
        context: "api/user/me",
        data: { userId, email: session.user.email }
      });
      
      // Create the user in our database
      const newUser = await db.insert(users).values({
        id: userId,
        name: session.user.name || '',
        email: session.user.email,
        image: session.user.image || null,
        role: "VIEWER", // Default role
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      if (newUser.length > 0) {
        const { hashedPassword, ...userWithoutPassword } = newUser[0];
        
        return NextResponse.json({
          ...userWithoutPassword,
          source: "nextauth"
        });
      }
    }
    
    return NextResponse.json({ error: "Não foi possível encontrar ou criar o usuário" }, { status: 404 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    logger.error(`Erro ao obter informações do usuário: ${errorMessage}`, {
      context: "api/user/me",
      data: { error: errorMessage }
    });
    
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 