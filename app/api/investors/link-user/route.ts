import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { investors, userInvestorLinks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email!;
    const userName = session.user.name;
    const userRole = session.user.role;

    logger.info(`[INVESTOR_LINK_USER_POST] Iniciando processo para usuário: ${userEmail} (Role: ${userRole})`);

    // Buscar dados completos do usuário
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      logger.error(`[INVESTOR_LINK_USER_POST] Usuário não encontrado no banco: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logger.info(`[INVESTOR_LINK_USER_POST] Usuário encontrado: ${user[0].email}`);

    // Verificar se já existe link
    const existingLink = await db
      .select()
      .from(userInvestorLinks)
      .where(eq(userInvestorLinks.userId, userId))
      .limit(1);

    if (existingLink.length > 0) {
      logger.info(`[INVESTOR_LINK_USER_POST] Link já existe para usuário ${userId}`);
      
      // Buscar dados do investidor linkado
      const linkedInvestor = await db
        .select()
        .from(investors)
        .where(eq(investors.id, existingLink[0].investorId))
        .limit(1);

      return NextResponse.json({ 
        success: true,
        message: "Usuário já conectado a um investidor",
        linked: true,
        investor: {
          id: linkedInvestor[0]?.id,
          name: linkedInvestor[0]?.name,
          email: linkedInvestor[0]?.email,
        }
      });
    }

    // Buscar investidor pelo email
    let investor = await db
      .select()
      .from(investors)
      .where(eq(investors.email, userEmail))
      .limit(1);

    logger.info(`[INVESTOR_LINK_USER_POST] Busca por investidor com email ${userEmail}: ${investor.length > 0 ? 'Encontrado' : 'Não encontrado'}`);

    // Se não encontrou investidor e o usuário tem role INVESTOR, criar automaticamente
    if (investor.length === 0 && userRole === 'INVESTOR') {
      logger.info(`[INVESTOR_LINK_USER_POST] Criando perfil de investidor automaticamente para ${userEmail}`);
      
      const newInvestorId = createId();
      await db
        .insert(investors)
        .values({
          id: newInvestorId,
          name: userName || userEmail.split('@')[0], // Usar nome do usuário ou parte do email
          email: userEmail,
          phone: null,
          city: null,
          address: null,
          startedInvestingAt: new Date(),
          endedInvestingAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Buscar o investidor recém criado
      investor = await db
        .select()
        .from(investors)
        .where(eq(investors.id, newInvestorId))
        .limit(1);

      logger.info(`[INVESTOR_LINK_USER_POST] Perfil de investidor criado automaticamente: ${newInvestorId}`);
    }

    // Se ainda não encontrou investidor, retornar erro
    if (investor.length === 0) {
      logger.warn(`[INVESTOR_LINK_USER_POST] Nenhum perfil de investidor encontrado para ${userEmail}`);
      return NextResponse.json({ 
        error: "Nenhum perfil de investidor encontrado para este email",
        linked: false,
        message: "Usuário não está autorizado como investidor"
      }, { status: 404 });
    }

    // Criar link entre usuário e investidor
    const linkId = createId();
    await db
      .insert(userInvestorLinks)
      .values({
        id: linkId,
        userId: userId,
        investorId: investor[0].id,
      });

    logger.info(`[INVESTOR_LINK_USER_POST] Link criado entre usuário ${userId} e investidor ${investor[0].id}`);

    return NextResponse.json({
      success: true,
      linked: true,
      investorId: investor[0].id,
      message: "Usuário conectado ao perfil de investidor com sucesso",
      investor: {
        id: investor[0].id,
        name: investor[0].name,
        email: investor[0].email,
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[INVESTOR_LINK_USER_POST] Erro: ${errorMessage}`);
    console.error("[INVESTOR_LINK_USER_POST]", error);
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

    const userId = session.user.id;
    
    logger.info(`[INVESTOR_LINK_USER_GET] Verificando link para usuário: ${userId}`);

    // Buscar link do investidor
    const investorLink = await db
      .select({
        investorId: userInvestorLinks.investorId,
        investorName: investors.name,
        investorEmail: investors.email,
        investorPhone: investors.phone,
        investorCity: investors.city,
        investorAddress: investors.address,
        startedInvestingAt: investors.startedInvestingAt,
      })
      .from(userInvestorLinks)
      .leftJoin(investors, eq(userInvestorLinks.investorId, investors.id))
      .where(eq(userInvestorLinks.userId, userId))
      .limit(1);

    if (investorLink.length === 0) {
      logger.info(`[INVESTOR_LINK_USER_GET] Nenhum link encontrado para usuário: ${userId}`);
      return NextResponse.json({ 
        linked: false,
        message: "Usuário não está conectado a nenhum investidor" 
      });
    }

    logger.info(`[INVESTOR_LINK_USER_GET] Link encontrado para usuário ${userId} -> investidor ${investorLink[0].investorId}`);

    return NextResponse.json({
      linked: true,
      investor: {
        id: investorLink[0].investorId,
        name: investorLink[0].investorName,
        email: investorLink[0].investorEmail,
        phone: investorLink[0].investorPhone,
        city: investorLink[0].investorCity,
        address: investorLink[0].investorAddress,
        startedInvestingAt: investorLink[0].startedInvestingAt,
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[INVESTOR_LINK_USER_GET] Erro: ${errorMessage}`);
    console.error("[INVESTOR_LINK_USER_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json({ 
    error: "Método PUT não implementado",
    message: "Use POST para criar links ou GET para consultar"
  }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: "Método DELETE não implementado",
    message: "Use POST para criar links ou GET para consultar"
  }, { status: 501 });
}