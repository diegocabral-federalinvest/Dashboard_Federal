import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db/drizzle";
import { users, invitations } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import logger from "@/lib/logger";

const invitedUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = invitedUserSchema.parse(body);

    const { name, email, password } = validatedData;
    const normalizedEmail = email.toLowerCase().trim();

    logger.info(`[REGISTER_INVITED] Tentativa de registro para email: ${normalizedEmail}`);

    // 1. Verificar se o email está na tabela de convites com status PENDING
    const invitation = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        status: invitations.status,
        role: invitations.role,
        type: invitations.type,
      })
      .from(invitations)
      .where(
        and(
          eq(invitations.email, normalizedEmail),
          eq(invitations.status, "PENDING")
        )
      )
      .limit(1);

    if (invitation.length === 0) {
      logger.warn(`[REGISTER_INVITED] Email não convidado ou convite não pendente: ${normalizedEmail}`);
      return NextResponse.json(
        { 
          error: "Email não autorizado", 
          message: "Este email não possui um convite pendente. Entre em contato com o administrador para receber um convite." 
        },
        { status: 403 }
      );
    }

    const invitationData = invitation[0];
    logger.info(`[REGISTER_INVITED] Convite encontrado para ${normalizedEmail} com role: ${invitationData.role}`);

    // 2. Verificar se o usuário já existe
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      logger.warn(`[REGISTER_INVITED] Usuário já existe: ${normalizedEmail}`);
      return NextResponse.json(
        { 
          error: "Email já cadastrado", 
          message: "Este email já possui uma conta. Tente fazer login ou recuperar sua senha." 
        },
        { status: 409 }
      );
    }

    // 3. Hash da senha
    const hashedPassword = await hash(password, 10);

    // 4. Criar usuário com a role do convite
    const userId = createId();
    const newUser = await db.insert(users).values({
      id: userId,
      name,
      email: normalizedEmail,
      hashedPassword,
      role: invitationData.role, // Usar a role do convite
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ 
      id: users.id, 
      name: users.name, 
      email: users.email, 
      role: users.role 
    });

    // 5. Atualizar o status do convite para ACCEPTED
    await db
      .update(invitations)
      .set({ status: "ACCEPTED" })
      .where(eq(invitations.id, invitationData.id));

    logger.info(`[REGISTER_INVITED] Usuário criado com sucesso: ${normalizedEmail} com role: ${invitationData.role}`);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
      },
      message: "Conta criada com sucesso! Você pode fazer login agora."
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`[REGISTER_INVITED] Dados inválidos: ${JSON.stringify(error.errors)}`);
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: error.errors.map(err => err.message).join(", ") 
        },
        { status: 400 }
      );
    }

    logger.error(`[REGISTER_INVITED] Erro interno: ${error instanceof Error ? error.message : String(error)}`);
    console.error("[REGISTER_INVITED]", error);
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        message: "Ocorreu um erro inesperado. Tente novamente em alguns minutos." 
      },
      { status: 500 }
    );
  }
} 