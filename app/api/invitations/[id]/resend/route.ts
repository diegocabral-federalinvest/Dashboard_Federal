// TEMPORARIAMENTE DESABILITADO - Migração NextAuth em andamento
// TODO: Corrigir referências do Clerk para NextAuth

import { NextResponse } from "next/server";

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

export async function DELETE() {
  return NextResponse.json({ 
    error: "Endpoint temporariamente desabilitado durante migração NextAuth",
    message: "Este endpoint será reativado após a migração completa do Clerk para NextAuth"
  }, { status: 503 });
}

/* CÓDIGO ORIGINAL (comentado para preservar):
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { db } from "@/db/drizzle";
// import { users, invitations } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import logger from "@/lib/logger";
// 
// export async function POST(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Verify authentication
//     const session = await getServerSession();
//     
//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     
//     // Get current user to check role
//     const currentUser = await db.select({ role: users.role })
//       .from(users)
//       .where(eq(users.clerkId, userId))
//       .limit(1);
//     
//     // Only ADMIN can resend invitations
//     if (!currentUser.length || currentUser[0].role !== "ADMIN") {
//       logger.warn("Non-admin user attempted to resend invitation", {
//         action: 'POST /api/invitations/[id]/resend'
//       });
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }
//     
//     // Get invitation ID
//     const { id } = params;
//     
//     if (!id) {
//       return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });
//     }
//     
//     // Find the invitation
//     const [invitation] = await db.select()
//       .from(invitations)
//       .where(eq(invitations.id, id))
//       .limit(1);
//     
//     if (!invitation) {
//       return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
//     }
//     
//     // Check if invitation is still pending
//     if (invitation.status !== "PENDING") {
//       return NextResponse.json({ 
//         error: "Cannot resend invitation that is not pending", 
//         status: invitation.status
//       }, { status: 400 });
//     }
//     
//     // Here you would implement the email resend functionality
//     // For example:
//     // await sendInvitationEmail(invitation.email, invitation.role);
//     
//     logger.info(`Invitation email resent to ${invitation.email}`, {
//       context: 'api/invitations/[id]/resend'
//     });
//     
//     return NextResponse.json({
//       success: true,
//       message: "Invitation resent successfully"
//     });
//     
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";
//     logger.error(`Error resending invitation: ${errorMessage}`, {
//       context: 'api/invitations/[id]/resend',
//     });
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// } 
*/