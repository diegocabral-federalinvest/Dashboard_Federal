import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_CONFIG } from './lib/constants';

// Hardcoded constants for auth
const AUTH_SECRET = "fpSdDM+9wScCSfqNECLNcQ193UpIInrFT4fgIZWfb9E=";

// Security headers para todas as respostas
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;
  const userAgent = req.headers.get('user-agent') || '';
  
  // Log para monitoramento de segurança
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  // Proteção contra bots maliciosos e user agents suspeitos
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /<script/i,
    /javascript:/i,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.error(`Security: Blocked suspicious user agent for ${path} | IP: ${clientIp}`);
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Rotas públicas - sempre permitir
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up', 
    '/api/auth',
    '/site',
    '/sobre',
    '/contato',
    '/servicos',
    '/funcionalidades',
    '/aprenda-usar'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route) || path.includes('/api/auth')
  );
  
  // Rotas protegidas - requerem autenticação
  const protectedRoutes = [
    '/dre',
    '/investimentos', 
    '/operacoes',
    '/configuracoes',
    '/usuarios',
    '/suporte',
    '/historico-uploads',
    '/investidor',
    '/api/finance',
    '/api/investments',
    '/api/expenses',
    '/api/entries',
    '/api/reports',
    '/api/users',
    '/api/user',
    '/api/investors',
    '/api/invitations',
    '/api/upload-history'
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isApiRoute = path.startsWith('/api/');
  
  // Para rotas públicas, apenas adicionar headers de segurança
  if (isPublicRoute) {
    const response = NextResponse.next();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  // Verificar autenticação para rotas protegidas
  if (isProtectedRoute) {
    try {
      const session = await getToken({ 
        req, 
        secret: AUTH_CONFIG.NEXTAUTH_SECRET,
        secureCookie: false,
      });
      
      if (!session || !session.sub) {
        console.warn(`Unauthorized access attempt: ${path} | IP: ${clientIp}`);
        
        // Para API routes, retornar 401
        if (isApiRoute) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Autenticação necessária' },
            { status: 401 }
          );
        }
        
        // Para páginas, redirecionar para login
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
      }
      
      // Verificações adicionais de segurança
      const now = Date.now() / 1000;
      
      // Verificar expiração do token
      if (session.exp && typeof session.exp === 'number' && session.exp < now) {
        console.warn(`Token expired for: ${session.email} | Path: ${path}`);
        
        if (isApiRoute) {
          return NextResponse.json(
            { error: 'Token expired', message: 'Token expirado' },
            { status: 401 }
          );
        }
        
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        signInUrl.searchParams.set('error', 'SessionExpired');
        return NextResponse.redirect(signInUrl);
      }
      
      // Adicionar headers de segurança na resposta
      const response = NextResponse.next();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // Adicionar informações do usuário no header para APIs
      if (isApiRoute) {
        response.headers.set('X-User-ID', session.sub);
        response.headers.set('X-User-Role', session.role as string || 'VIEWER');
      }
      
      return response;
      
    } catch (error) {
      console.error(`Authentication error: ${error} | Path: ${path}`);
      
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Authentication error', message: 'Erro interno de autenticação' },
          { status: 500 }
        );
      }
      
      // Em caso de erro, redirecionar para login
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('error', 'AuthError');
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Para outras rotas não definidas, aplicar headers de segurança
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};