import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import logger from "@/lib/logger";

// Schema for validation with uppercase roles
const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"]),
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
      logger.warn("Non-admin user attempted to update user role", {
        context: 'PATCH /api/users/[id]/role',
        action: 'PATCH /api/users/[id]/role'
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
    const { role } = updateRoleSchema.parse(body);
    
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

    // Check if this is a protected admin (can't modify role)
    const protectedAdminEmails = [
      "pedro-eli@hotmail.com",
      "diego.cabral@federalinvest.com.br"
    ];
    
    // Check if current user is a super admin
    const isSuperAdmin = protectedAdminEmails.includes(adminUser.email.toLowerCase());
    
    // Only super admin can modify role of protected admins
    if (protectedAdminEmails.includes(targetUser.email.toLowerCase()) && !isSuperAdmin) {
      return NextResponse.json({
        error: "Only super admins can modify role of protected admin accounts"
      }, { status: 403 });
    }
    
    // Update user role in database
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id));
    
    logger.info(`User role updated successfully: ${targetUser.email} -> ${role}`, {
      context: 'api/users/[id]/role'
    });
    
    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      role
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error updating user role: ${errorMessage}`, {
      context: 'api/users/[id]/role'
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user roles"
  }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user roles"
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user roles"
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: "Method not allowed",
    message: "Use PATCH to update user roles"
  }, { status: 405 });
}