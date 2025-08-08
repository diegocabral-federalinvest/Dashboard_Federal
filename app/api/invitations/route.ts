import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { users, invitations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import logger from "@/lib/logger";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

// Schema customizado para criação de convites - id é opcional
const createInvitationSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"], {
    required_error: "Role é obrigatório",
  }),
  type: z.enum(["NORMAL", "INVESTOR"], {
    required_error: "Type é obrigatório",
  }),
  status: z.enum(["PENDING", "ACCEPTED", "REVOKED"]).optional().default("PENDING"),
});

export async function GET() {
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
    
    // Only ADMIN can access invitations list
    if (!currentUser.length || currentUser[0].role !== "ADMIN") {
      logger.warn("Non-admin user attempted to access invitations list", {
        action: 'GET /api/invitations'
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get all invitations
    const allInvitations = await db.select()
      .from(invitations)
      .orderBy(asc(invitations.email));
    
    return NextResponse.json(allInvitations);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error fetching invitations: ${errorMessage}`, {
      context: 'api/invitations',
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    
    // Only ADMIN can create invitations
    if (!currentUser.length || currentUser[0].role !== "ADMIN") {
      logger.warn("Non-admin user attempted to create invitation", {
        action: 'POST /api/invitations'
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Validate request body
    const body = await req.json();
    
    // Log the received data for debugging
    logger.info(`Invitation request data: ${JSON.stringify(body)}`, {
      context: 'api/invitations',
    });
    
    // Use custom schema to validate (id is optional)
    let data;
    try {
      data = createInvitationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(`Invalid invitation data: ${JSON.stringify(error.errors)}`, {
          context: 'api/invitations',
        });
        return NextResponse.json({ 
          error: "Invalid request data", 
          details: error.errors 
        }, { status: 400 });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown validation error";
      logger.error(`Invalid invitation data: ${errorMessage}`, {
        context: 'api/invitations',
      });
      return NextResponse.json({ error: "Invalid request data", details: errorMessage }, { status: 400 });
    }

    // Enforce role when type is INVESTOR
    const enforcedRole: "ADMIN" | "EDITOR" | "INVESTOR" | "VIEWER" =
      data.type === "INVESTOR" ? "INVESTOR" : data.role;
    if (data.type === "INVESTOR" && data.role !== "INVESTOR") {
      logger.warn("Role overridden to INVESTOR due to type INVESTOR", {
        context: 'api/invitations',
        data: { providedRole: data.role },
      });
    }
    
    // Check if email is already invited
    console.log("🔍 [INVITATIONS_POST] Verificando convite existente para:", data.email);
    const existingInvitation = await db.select({ id: invitations.id, status: invitations.status })
      .from(invitations)
      .where(eq(invitations.email, data.email))
      .limit(1);
    
    console.log("📊 [INVITATIONS_POST] Resultado da busca por convite:", {
      emailBuscado: data.email,
      encontrados: existingInvitation.length,
      dadosEncontrados: existingInvitation.length > 0 ? existingInvitation[0] : null
    });
    
    if (existingInvitation.length > 0) {
      // If there's an existing invitation that's not revoked, reject
      if (existingInvitation[0].status !== "REVOKED") {
        console.log("💥 [INVITATIONS_POST] CONVITE JÁ EXISTE - Status:", existingInvitation[0].status, "- Retornando erro 409");
        return NextResponse.json({ 
          error: "User already has an invitation", 
          invitationId: existingInvitation[0].id 
        }, { status: 409 });
      }
      
      console.log("🔄 [INVITATIONS_POST] Convite existente REVOGADO - Atualizando...");
      // If it's revoked, update it instead of creating a new one
      await db.update(invitations)
        .set({ 
          status: "PENDING", 
          role: enforcedRole,
          type: data.type 
        })
        .where(eq(invitations.id, existingInvitation[0].id));
      
      const updatedInvitation = await db.select()
        .from(invitations)
        .where(eq(invitations.id, existingInvitation[0].id))
        .limit(1);
      
      // Send invitation email (placeholder for now)
      try {
        // This would be your email sending implementation
        // await sendInvitationEmail(data.email, data.role);
        
        logger.info(`Invitation email sent to ${data.email} with role ${enforcedRole}`, {
          context: 'api/invitations',
        });
      } catch (emailError) {
        logger.error(`Failed to send invitation email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`, {
          context: 'api/invitations',
        });
        // Continue even if email fails, just log it
      }
      
      return NextResponse.json(updatedInvitation[0]);
    }
    
    console.log("✅ [INVITATIONS_POST] Nenhum convite existente - Criando novo convite...");
    
    // Generate ID if not provided
    const id = data.id || createId();
    
    try {
      const newInvitation = await db.insert(invitations)
        .values({
          id,
          email: data.email,
          role: enforcedRole,
          type: data.type,
          status: "PENDING",
        })
        .returning();
      
      // Send invitation email (placeholder for now)
      try {
        // This would be your email sending implementation
        // await sendInvitationEmail(data.email, data.role);
        
        logger.info(`Invitation email sent to ${data.email} with role ${enforcedRole}`, {
          context: 'api/invitations',
        });
      } catch (emailError) {
        logger.error(`Failed to send invitation email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`, {
          context: 'api/invitations',
        });
        // Continue even if email fails, just log it
      }
      
      logger.info(`New invitation created for ${data.email} with role ${enforcedRole}`, {
        context: 'api/invitations',
      });
      
      return NextResponse.json(newInvitation[0]);
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : "Unknown database error";
      logger.error(`Database error creating invitation: ${errorMessage}`, {
        context: 'api/invitations',
        data: data
      });
      return NextResponse.json({ error: "Database error", details: errorMessage }, { status: 500 });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error creating invitation: ${errorMessage}`, {
      context: 'api/invitations',
    });
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ 
    error: "Endpoint DELETE not implemented",
    message: "DELETE method not available for invitations"
  }, { status: 503 });
}