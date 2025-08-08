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

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { db } from "@/db/drizzle";
// import { users, invitations } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import logger from "@/lib/logger";
// 
// /**
//  * Endpoint para sincronizar convites com usuários existentes
//  * Marca convites como ACCEPTED se o usuário já criou conta
//  */
// export async function POST() {
//   try {
//     const session = await getServerSession();
//     
//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
// 
//     const currentUser = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, userId))
//       .limit(1);
// 
//     if (currentUser.length === 0) {
//       return NextResponse.json({ 
//         error: "Usuário não encontrado" 
//       }, { status: 404 });
//     }
// 
//     if (currentUser[0].role !== 'ADMIN') {
//       return NextResponse.json({ 
//         error: "Permissão negada" 
//       }, { status: 403 });
//     }
// 
//     // Get all users
//     const allUsers = await db
//       .select({ id: users.id, email: users.email })
//       .from(users);
// 
//     logger.info(`Admin ${userId} iniciou sincronização de convites`, {
//       context: 'invitations-sync',
//       source: 'backend'
//     });
// 
//     // Buscar todos os convites pendentes
//     const pendingInvitations = await db
//       .select()
//       .from(invitations)
//       .where(eq(invitations.status, 'PENDING'));
// 
//     console.log(`🔍 Encontrados ${pendingInvitations.length} convites pendentes`);
// 
//     let syncedCount = 0;
//     const syncedInvitations = [];
// 
//     // Para cada convite pendente, verificar se existe usuário com o mesmo email
//     for (const invitation of pendingInvitations) {
//       try {
//         const [existingUser] = await db
//           .select({ id: users.id, email: users.email })
//           .from(users)
//           .where(eq(users.email, invitation.email))
//           .limit(1);
// 
//         if (existingUser) {
//           // Usuário existe! Marcar convite como aceito
//           await db
//             .update(invitations)
//             .set({ status: 'ACCEPTED' })
//             .where(eq(invitations.id, invitation.id));
// 
//           syncedCount++;
//           syncedInvitations.push({
//             email: invitation.email,
//             role: invitation.role,
//             userId: existingUser.id
//           });
// 
//           console.log(`✅ Convite sincronizado: ${invitation.email} → ACCEPTED`);
//           
//           logger.info(`Convite sincronizado automaticamente`, {
//             context: 'invitations-sync',
//             source: 'backend',
//             data: { 
//               email: invitation.email, 
//               role: invitation.role,
//               userId: existingUser.id
//             }
//           });
//         }
//       } catch (error) {
//         console.error(`❌ Erro ao sincronizar convite ${invitation.email}:`, error);
//         logger.error(`Erro ao sincronizar convite individual`, {
//           context: 'invitations-sync',
//           source: 'backend',
//           data: { 
//             email: invitation.email,
//             error: error instanceof Error ? error.message : String(error)
//           }
//         });
//       }
//     }
// 
//     logger.info(`Sincronização de convites concluída`, {
//       context: 'invitations-sync',
//       source: 'backend',
//       data: { 
//         totalPending: pendingInvitations.length,
//         synced: syncedCount
//       }
//     });
// 
//     return NextResponse.json({
//       success: true,
//       message: `Sincronização concluída com sucesso`,
//       stats: {
//         totalPendingChecked: pendingInvitations.length,
//         syncedInvitations: syncedCount,
//         remainingPending: pendingInvitations.length - syncedCount
//       },
//       syncedInvitations
//     });
// 
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : "Unknown error";
//     logger.error(`Erro na sincronização de convites: ${errorMessage}`, {
//       context: 'invitations-sync',
//       source: 'backend',
//       error: error instanceof Error ? error : new Error(String(error))
//     });
//     
//     return NextResponse.json({ 
//       error: "Internal server error", 
//       success: false 
//     }, { status: 500 });
//   }
// }