"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@federalinvest.com");
  const [password, setPassword] = useState("admin123!@#");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Capturar erro da URL se houver
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      console.log("❌ Erro capturado da URL:", errorParam);
      if (errorParam === 'CredentialsSignin') {
        setError("Email ou senha incorretos");
      } else {
        setError(`Erro de autenticação: ${errorParam}`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/"
      });

      if (result?.error) {
        
        // Mapear erros específicos
        let errorMessage = "Erro durante o login";
        if (result.error === 'CredentialsSignin') {
          errorMessage = "Email ou senha incorretos";
        } else if (result.error === 'CallbackRouteError') {
          errorMessage = "Erro interno do servidor";
        } else {
          errorMessage = `Erro: ${result.error}`;
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.href = "/";
      } else {
        setError("Falha na autenticação");
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Sign-in error:", error);
      setError("Erro interno durante login");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
          <LogIn className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="text-gray-600 text-sm">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg border text-red-700 bg-red-50 border-red-200">
            <div className="flex-shrink-0 mt-0.5">
              <Loader2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Erro no login</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link
            href="/sign-up"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mx-auto w-48"></div>
          <div className="h-4 bg-gray-200 rounded mx-auto w-64"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
} 