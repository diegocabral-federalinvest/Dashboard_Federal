// TEMPORARIAMENTE DESABILITADO - Migração NextAuth em andamento
// TODO: Corrigir referências do Clerk para NextAuth

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import { users, permissions, investments, userInvestorLinks } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import logger from "@/lib/logger";

export async function GET() {
  return NextResponse.json({ 
    error: "Endpoint temporariamente desabilitado durante migração NextAuth",
    message: "Este endpoint será reativado após a migração completa do Clerk para NextAuth"
  }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ 
    error: "Endpoint temporariamente desabilitado durante migração NextAuth",
    message: "Este endpoint será reativado após a migração completa do Clerk para NextAuth"
  }, { status: 503 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: "Endpoint temporariamente desabilitado durante migração NextAuth",
    message: "Este endpoint será reativado após a migração completa do Clerk para NextAuth"
  }, { status: 503 });
}

export async function DELETE(
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
      logger.warn("Non-admin user attempted to delete user", {
        context: 'DELETE /api/users/[id]',
        action: 'DELETE /api/users/[id]'
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get target user ID
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    
    // Get target user
    const [targetUser] = await db
      .select({ 
        email: users.email, 
        role: users.role
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
      
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is a protected admin (can't be deleted)
    const protectedAdminEmails = [
      "pedro-eli@hotmail.com",
      "diego.cabral@federalinvest.com.br"
    ];
    
    // Check if current user is a super admin
    const isSuperAdmin = protectedAdminEmails.includes(adminUser.email.toLowerCase());
    
    // Protected admins can't be deleted, even by super admins
    if (protectedAdminEmails.includes(targetUser.email.toLowerCase())) {
      return NextResponse.json({
        error: "Protected admin accounts cannot be deleted"
      }, { status: 403 });
    }
    
    // Can't delete yourself
    if (targetUser.email === adminUser.email) {
      return NextResponse.json({
        error: "You cannot delete your own account"
      }, { status: 403 });
    }
    
    // Check if user has active investments (check through user-investor relationships)
    if (targetUser.role === "INVESTOR") {
      // First, check if this user is linked to any investor records
      const linkedInvestors = await db
        .select({ investorId: userInvestorLinks.investorId })
        .from(userInvestorLinks)
        .where(eq(userInvestorLinks.userId, id));
        
      // If linked to investors, check if those investors have active investments
      if (linkedInvestors.length > 0) {
        const investorIds = linkedInvestors.map(link => link.investorId);
        
        const [hasInvestments] = await db
          .select({ id: investments.id })
          .from(investments)
          .where(inArray(investments.investorId, investorIds))
          .limit(1);
          
        if (hasInvestments) {
          return NextResponse.json({
            error: "Cannot delete investor with active investments. Please transfer or close investments first."
          }, { status: 400 });
        }
      }
    }
    
    // Delete related records in a transaction to avoid foreign key constraints
    try {
      // Delete permissions record first (to avoid foreign key constraint)
      await db.delete(permissions).where(eq(permissions.email, targetUser.email));
      
      // Delete user-investor links if they exist
      await db.delete(userInvestorLinks).where(eq(userInvestorLinks.userId, id));
      
      // Delete user from database
      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!deletedUser) {
        logger.error(`Failed to delete user from database: ${targetUser.email}`, {
          context: 'api/users/[id]/delete'
        });
        return NextResponse.json({ 
          error: "Failed to delete user" 
        }, { status: 500 });
      }

      logger.info(`User deleted successfully: ${targetUser.email}`, {
        context: 'api/users/[id]/delete'
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      logger.error(`Database deletion failed for user ${targetUser.email}: ${errorMessage}`, {
        context: 'api/users/[id]/delete'
      });
      
      // Check if it's a specific foreign key constraint error
      if (errorMessage.includes('foreign key constraint')) {
        return NextResponse.json({
          error: "Cannot delete user due to related data. Please ensure all related records are cleaned up first."
        }, { status: 400 });
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully from database."
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error deleting user: ${errorMessage}`, {
      context: 'api/users/[id]/delete',
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}