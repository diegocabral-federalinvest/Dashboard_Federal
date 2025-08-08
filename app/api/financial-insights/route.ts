import { NextResponse } from 'next/server';
import { FinancialInsightsService } from '@/lib/services/financial-insights-service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter todos os insights
    const insights = await FinancialInsightsService.getAllInsights();
    
    // Retornar resposta
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Erro ao buscar insights financeiros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar insights financeiros' },
      { status: 500 }
    );
  }
} 