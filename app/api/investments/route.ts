import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/db/drizzle";
import { contributionsOrWithdrawals, investors, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Schema de validação para criação de aportes/retiradas
const createInvestmentSchema = z.object({
  investorId: z.string().min(1, "ID do investidor é obrigatório"),
  value: z.coerce.number().positive("Valor deve ser positivo"),
  type: z.enum(["aporte", "retirada"], {
    required_error: "Tipo de operação é obrigatório",
  }),
  date: z.union([
    z.string().datetime(),
    z.string().transform(val => new Date(val)),
    z.date()
  ]).default(() => new Date()),
  startDate: z.union([
    z.string().datetime(),
    z.string().transform(val => new Date(val)),
    z.date()
  ]).default(() => new Date()),
  // investorName agora é opcional - será buscado automaticamente baseado no investorId
  investorName: z.string().optional(),
  description: z.string().optional(),
  returnRate: z.coerce.number().optional().default(0.0004),
  status: z.enum(["active", "completed", "withdrawn"]).optional().default("active"),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const investorId = searchParams.get("investorId");

    const records = await db
      .select({
        id: contributionsOrWithdrawals.id,
        value: contributionsOrWithdrawals.amount,
        investorId: contributionsOrWithdrawals.investorId,
        date: contributionsOrWithdrawals.date,
        createdAt: contributionsOrWithdrawals.createdAt,
        updatedAt: contributionsOrWithdrawals.updatedAt,
        investorName: investors.name,
      })
      .from(contributionsOrWithdrawals)
      .leftJoin(investors, eq(contributionsOrWithdrawals.investorId, investors.id))
      .where(investorId ? eq(contributionsOrWithdrawals.investorId, investorId) : undefined)
      .orderBy(desc(contributionsOrWithdrawals.date));

    const investments = records.map((r) => ({
      id: r.id,
      value: Math.abs(Number(r.value)), // Sempre mostrar valor absoluto no frontend
      type: Number(r.value) >= 0 ? "aporte" : "retirada",
      investorId: r.investorId,
      investorName: r.investorName ?? "",
      description: Number(r.value) >= 0 ? "Aporte" : "Retirada",
      date: r.date.toISOString(),
      startDate: r.date.toISOString(),
      returnRate: 0.0004,
      status: Number(r.value) >= 0 ? "active" : "withdrawn",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json(investments);
  } catch (error) {
    console.error("[INVESTMENTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se é admin ou editor usando o email da sessão
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user.length || !["ADMIN", "EDITOR"].includes(user[0].role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    console.log("📝 [INVESTMENTS_POST] Request body:", body);
    console.log("📝 [INVESTMENTS_POST] Request body keys:", Object.keys(body));

    let validatedData;
    try {
      console.log("🔍 [INVESTMENTS_POST] Starting validation...");
      validatedData = createInvestmentSchema.parse(body);
      console.log("✅ [INVESTMENTS_POST] Validated data:", validatedData);
      console.log("✅ [INVESTMENTS_POST] Validated data keys:", Object.keys(validatedData));
    } catch (validationError) {
      console.error("❌ [INVESTMENTS_POST] Validation error:", validationError);
      console.error("❌ [INVESTMENTS_POST] Original body that failed:", body);
      
      if (validationError instanceof z.ZodError) {
        console.error("❌ [INVESTMENTS_POST] Zod errors:", validationError.errors);
        return NextResponse.json(
          { 
            error: "Validation failed",
            details: validationError.errors,
            receivedData: body
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Verificar se investor existe
    console.log("🔍 [INVESTMENTS_POST] Searching for investor with ID:", validatedData.investorId);
    
    const investor = await db
      .select({ id: investors.id, name: investors.name })
      .from(investors)
      .where(eq(investors.id, validatedData.investorId))
      .limit(1);

    console.log("📊 [INVESTMENTS_POST] Investor search result:", {
      searchedId: validatedData.investorId,
      foundInvestors: investor,
      investorCount: investor.length
    });

    if (!investor.length) {
      console.error("❌ [INVESTMENTS_POST] Investor not found:", validatedData.investorId);
      return NextResponse.json(
        {
          error: "Investidor não encontrado",
          details: `ID: ${validatedData.investorId}`,
        },
        { status: 400 }
      );
    }

    const investorName = investor[0].name;
    console.log("✅ [INVESTMENTS_POST] Found investor:", { 
      id: investor[0].id, 
      name: investorName,
      sentName: validatedData.investorName,
      usingFoundName: investorName 
    });

    // Calcular valor final (aporte = positivo, retirada = negativo)
    const finalAmount = validatedData.type === "aporte" 
      ? validatedData.value 
      : -validatedData.value;

    console.log("💰 [INVESTMENTS_POST] Amount calculation:", {
      originalValue: validatedData.value,
      type: validatedData.type,
      finalAmount
    });

    // Garantir que a data seja um objeto Date
    const investmentDate = validatedData.date instanceof Date 
      ? validatedData.date 
      : new Date(validatedData.date);

    // Garantir que a startDate seja um objeto Date
    const startDate = validatedData.startDate instanceof Date 
      ? validatedData.startDate 
      : new Date(validatedData.startDate);
    
    console.log("📅 [INVESTMENTS_POST] Date processing:", {
      originalDate: validatedData.date,
      processedDate: investmentDate,
      originalStartDate: validatedData.startDate,
      processedStartDate: startDate
    });
    
    // Dados para inserção
    const insertData = {
      id: uuidv4(),
      amount: finalAmount.toString(),
      date: investmentDate,
      investorId: validatedData.investorId,
    };
    
    console.log("📝 [INVESTMENTS_POST] Inserting data:", insertData);
    
    // Criar aporte/retirada
    const newContribution = await db
      .insert(contributionsOrWithdrawals)
      .values(insertData)
      .returning();

    console.log("✅ [INVESTMENTS_POST] Created contribution:", newContribution[0]);

    const operationType = validatedData.type === "aporte" ? "Aporte" : "Retirada";
    const message = `${operationType} de R$ ${validatedData.value.toLocaleString('pt-BR')} ${validatedData.type === "aporte" ? "adicionado" : "subtraído"} para ${investorName}`;

    const responseData = {
      success: true,
      contribution: {
        ...newContribution[0],
        value: validatedData.value, // Retornar valor absoluto
        type: validatedData.type,
        investorName: investorName, // Usar nome encontrado no banco
        description: validatedData.description || operationType,
        startDate: startDate.toISOString(),
        returnRate: validatedData.returnRate,
        status: validatedData.status,
      },
      message,
    };
    
    console.log("🎉 [INVESTMENTS_POST] Success response:", responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("💥 [INVESTMENTS_POST] Unexpected error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name
    });
    
    if (error instanceof z.ZodError) {
      console.error("💥 [INVESTMENTS_POST] Zod validation error:", error.errors);
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
