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
// import { users, permissions } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { z } from "zod";
// import { createId } from "@paralleldrive/cuid2";
// import logger from "@/lib/logger";
// 
// // Schema for validation
// const updateAccessSchema = z.object({
//   access: z.boolean(),
// });
// 
// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Verify authentication
//     const { userId: clerkUserId } = auth();
//     
//     if (!clerkUserId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     
//     // Verify if user is an admin
//     const [adminUser] = await db
//       .select({ role: users.role })
//       .from(users)
//       .where(eq(users.clerkId, clerkUserId))
//       .limit(1);
//     
//     if (!adminUser || adminUser.role !== "ADMIN") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }
//     
//     // Get target user ID
//     const { id } = params;
//     
//     if (!id) {
//       return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
//     }
//     
//     // Validate request data
//     const body = await req.json();
//     const { access } = updateAccessSchema.parse(body);
//     
//     // Get target user email (needed for permissions table)
//     const [targetUser] = await db
//       .select({ email: users.email })
//       .from(users)
//       .where(eq(users.id, id))
//       .limit(1);
//       
//     if (!targetUser?.email) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }
// 
//     // Check if this is a protected admin (can't modify access)
//     const protectedAdminEmails = [
//       "pedro-eli@hotmail.com",
//       "diego.cabral@federalinvest.com.br"
//     ];
//     
//     if (protectedAdminEmails.includes(targetUser.email.toLowerCase())) {
//       return NextResponse.json({
//         error: "Cannot modify access for protected admin accounts"
//       }, { status: 403 });
//     }
//     
//     // Check if permission entry already exists
//     const [existingPermission] = await db
//       .select({ id: permissions.id })
//       .from(permissions)
//       .where(eq(permissions.email, targetUser.email))
//       .limit(1);
//     
//     if (existingPermission) {
//       // Update existing permission
//       await db
//         .update(permissions)
//         .set({ access })
//         .where(eq(permissions.email, targetUser.email));
//     } else {
//       // Create new permission entry
//       await db
//         .insert(permissions)
//         .values({
//           id: createId(),
//           email: targetUser.email,
//           access,
//         });
//     }
//     
//     logger.info(`User access updated: ${targetUser.email} -> ${access ? 'allowed' : 'blocked'}`, {
//       context: 'api/users/access',
//    
//     });
//     
//     return NextResponse.json({
//       success: true,
//       message: `User ${access ? 'allowed' : 'blocked'} successfully`,
//     });
//     
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";
//     logger.error(`Error updating user access: ${errorMessage}`, {
//       context: 'api/users/access',
//     });
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// } 
*/