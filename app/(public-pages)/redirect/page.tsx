'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading') {
      if (session?.user) {
        // Usuário logado - redirecionar para dashboard
        router.replace('/');
      } else {
        // Usuário não logado - redirecionar para login
        router.replace('/sign-in');
      }
    }
  }, [status, session, router]);

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-lg">Redirecionando...</p>
      </div>
    </div>
  );
} 