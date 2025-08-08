// TEMPORARIAMENTE DESABILITADO - Migração NextAuth em andamento
// TODO: Corrigir referências do Clerk para NextAuth

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import { users, invitations } from "@/db/schema";
import { authOptions } from "@/lib/auth-config";
import { eq } from "drizzle-orm";
import logger from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get current user to check role
    const currentUser = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    
    // Only ADMIN can access invitations
    if (!currentUser.length || currentUser[0].role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get specific invitation
    const invitation = await db.select()
      .from(invitations)
      .where(eq(invitations.id, params.id))
      .limit(1);
    
    if (!invitation.length) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    
    return NextResponse.json(invitation[0]);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching invitation: ${errorMessage}`, {
      context: 'api/invitations/[id]',
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
    
    // Get current user to check role
    const currentUser = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    
    // Only ADMIN can delete invitations
    if (!currentUser.length || currentUser[0].role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete invitation (or mark as revoked)
    await db.update(invitations)
      .set({ status: "REVOKED" })
      .where(eq(invitations.id, params.id));
    
    return NextResponse.json({ success: true, message: "Invitation revoked" });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error revoking invitation: ${errorMessage}`, {
      context: 'api/invitations/[id]',
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}