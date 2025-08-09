import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import logger from "@/lib/logger";

// Schema for validation
const updatePasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify if current user is an admin
    const [adminUser] = await db
      .select({ role: users.role, email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      logger.warn("Non-admin user attempted to update user password", {
        context: 'PATCH /api/users/[id]/password',
        action: 'PATCH /api/users/[id]/password',
        userId: session.user.id
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get target user ID
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    
    // Validate request data
    const body = await req.json();
    const validation = updatePasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid password", 
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const { password } = validation.data;
    
    // Get target user
    const [targetUser] = await db
      .select({ 
        email: users.email 
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
      
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update user password in database
    await db
      .update(users)
      .set({ 
        hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    logger.info(`User password updated successfully: ${targetUser.email}`, {
      context: 'api/users/[id]/password',
      adminEmail: adminUser.email,
      targetUserEmail: targetUser.email
    });
    
    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso"
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error updating user password: ${errorMessage}`, {
      context: 'api/users/[id]/password'
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user password"
  }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user password"
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user password"
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user password"
  }, { status: 405 });
}
