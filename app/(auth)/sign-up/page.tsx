"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  Mail,
  Lock,
  UserPlus
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  details?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setApiResponse(null);

    try {
      // Usar a nova API para usuários convidados
      const response = await fetch("/api/auth/register-invited", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiResponse({
          success: false,
          error: data.error,
          message: data.message,
          details: data.details
        });
        setIsLoading(false);
        return;
      }

      // Sucesso - mostrar mensagem de sucesso
      setApiResponse({
        success: true,
        message: data.message,
        user: data.user
      });

      // Aguardar um pouco para o usuário ver a mensagem de sucesso
      setTimeout(async () => {
        // Tentar fazer login automático
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          // Se o login automático falhar, redirecionar para login manual
          setApiResponse({
            success: true,
            message: "Conta criada com sucesso! Redirecionando para login..."
          });
          setTimeout(() => {
            router.push("/sign-in");
          }, 2000);
        } else {
          // Login automático bem-sucedido
          setApiResponse({
            success: true,
            message: "Conta criada e login realizado! Redirecionando..."
          });
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      }, 2000);

    } catch (error) {
      setApiResponse({
        success: false,
        error: "Erro de conexão",
        message: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      });
      setIsLoading(false);
    }
  };

  const getMessageIcon = () => {
    if (!apiResponse) return null;
    
    if (apiResponse.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getMessageColor = () => {
    if (!apiResponse) return "";
    
    if (apiResponse.success) {
      return "text-green-700 bg-green-50 border-green-200";
    } else {
      return "text-red-700 bg-red-50 border-red-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
        <p className="text-gray-600 text-sm">
          Cadastre-se com seu email de convite para acessar a plataforma
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Seu nome completo"
                      className="pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="seu@email.com"
                      type="email"
                      className="pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Mínimo 6 caracteres"
                      type="password"
                      className="pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Digite a senha novamente"
                      type="password"
                      className="pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {apiResponse && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${getMessageColor()}`}>
              <div className="flex-shrink-0 mt-0.5">
                {getMessageIcon()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {apiResponse.error || "Sucesso!"}
                </p>
                {apiResponse.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {apiResponse.message}
                  </p>
                )}
                {apiResponse.details && (
                  <p className="text-xs mt-1 opacity-75">
                    {apiResponse.details}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar conta
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      {/* Sign in link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </div>

      {/* Important notice */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Acesso por convite</p>
            <p className="text-xs leading-relaxed">
              Apenas emails convidados pelo administrador podem criar conta. Se você não foi convidado, 
              entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 