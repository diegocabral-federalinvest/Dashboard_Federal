import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { investors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

const createInvestorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.union([z.string(), z.null()]).optional(),
  city: z.union([z.string(), z.null()]).optional(),
  address: z.union([z.string(), z.null()]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    let validatedData;
    try {
      validatedData = createInvestorSchema.parse(body);
    } catch (zodError) {
      console.error("Validation failed:", zodError instanceof z.ZodError ? zodError.errors : zodError);
      return NextResponse.json(
        { error: "Dados inválidos", details: zodError instanceof z.ZodError ? zodError.errors : 'Erro de validação' },
        { status: 400 }
      );
    }

    const existingInvestor = await db
      .select()
      .from(investors)
      .where(eq(investors.email, validatedData.email))
      .limit(1);

    if (existingInvestor.length > 0) {
      return NextResponse.json(
        { error: "Já existe um investidor com este email" },
        { status: 400 }
      );
    }

    // Criar o investidor (inicialmente sem data de início até criar conta)
    const investorId = createId();
    
    const newInvestor = await db
      .insert(investors)
      .values({
        id: investorId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        city: validatedData.city,
        address: validatedData.address,
        startedInvestingAt: null, // Só será preenchido quando criar conta
      })
      .returning();

    // Criar convite para o investidor através da API de convites
    let invitationStatus = "NOT_CREATED";
    let invitationMessage = "";
    
    try {
      const invitationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'Cookie': request.headers.get('Cookie') || '',
        },
        body: JSON.stringify({
          email: validatedData.email,
          role: "INVESTOR",
          type: "INVESTOR",
        }),
      });
      
      if (invitationResponse.status === 409) {
        // Convite já existe - isso é OK, não é erro crítico
        invitationStatus = "ALREADY_EXISTS";
        invitationMessage = "Convite já foi enviado anteriormente";
      } else if (!invitationResponse.ok) {
        const errorText = await invitationResponse.text();
        console.warn(`Failed to create invitation: Status ${invitationResponse.status}`, errorText);
        invitationStatus = "FAILED";
        invitationMessage = `Falha ao criar convite (Status: ${invitationResponse.status})`;
      } else {
        invitationStatus = "CREATED";
        invitationMessage = "Convite criado com sucesso";
      }
    } catch (invitationError) {
      console.warn(`Error creating invitation:`, invitationError);
      invitationStatus = "FAILED";
      invitationMessage = `Erro ao criar convite: ${invitationError instanceof Error ? invitationError.message : 'Erro desconhecido'}`;
    }
    
    // Mensagem específica baseada no status do convite
    let successMessage = "Investidor cadastrado com sucesso";
    if (invitationStatus === "ALREADY_EXISTS") {
      successMessage += ". O convite já foi enviado anteriormente - o investidor pode verificar seu email para aceitar.";
    } else if (invitationStatus === "CREATED") {
      successMessage += " e convite enviado por email.";
    } else if (invitationStatus === "FAILED") {
      successMessage += ". Houve um problema no envio do convite, mas o investidor foi cadastrado.";
    }
    
    return NextResponse.json({
      success: true,
      investor: newInvestor[0],
      message: successMessage,
      invitationStatus: invitationStatus,
      invitationMessage: invitationMessage,
    });

  } catch (error) {
    console.error("Critical error in investors POST:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investorsData = await db
      .select({
        id: investors.id,
        name: investors.name,
        email: investors.email,
        phone: investors.phone,
        city: investors.city,
        address: investors.address,
        startedInvestingAt: investors.startedInvestingAt,
        endedInvestingAt: investors.endedInvestingAt,
        createdAt: investors.createdAt,
        updatedAt: investors.updatedAt,
      })
      .from(investors)
      .orderBy(investors.createdAt);

    // Adicionar status baseado se já criou conta
    const allInvestors = investorsData.map(investor => ({
      ...investor,
      status: investor.startedInvestingAt ? 'active' : 'pending'
    }));

    return NextResponse.json(allInvestors);

  } catch (error) {
    console.error("Error in investors GET:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 