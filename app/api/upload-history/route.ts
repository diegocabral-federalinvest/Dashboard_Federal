import { NextResponse } from 'next/server';
import { UploadHistoryService } from '@/lib/services/upload-history-service';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrair parâmetros de consulta
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const success = url.searchParams.get('success');
    
    // Calcular offset baseado na página
    const offset = (page - 1) * limit;
    
    // Filtros
    const filters: { success?: boolean } = {};
    if (success === 'true') filters.success = true;
    if (success === 'false') filters.success = false;
    
    // Buscar dados
    const { data, total } = await UploadHistoryService.getAll(limit, offset, filters);
    
    // Retornar resposta
    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        pageSize: limit,
        pageCount: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de uploads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de uploads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extrair dados do corpo
    const body = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['filename', 'originalFilename', 'fileSize', 'importedBy', 'success'];
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== false) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Criar registro
    const result = await UploadHistoryService.create(body);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar registro de upload:', error);
    return NextResponse.json(
      { error: 'Erro ao criar registro de upload' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 