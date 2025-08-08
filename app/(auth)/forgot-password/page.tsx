"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  ArrowLeft,
  Mail,
  Shield 
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um e-mail válido",
  }),
});

type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setApiResponse(null);

    try {
      // Simular chamada à API - você pode implementar a lógica real aqui
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sucesso - mostrar mensagem de sucesso
      setApiResponse({
        success: true,
        message: "Se o e-mail estiver cadastrado em nosso sistema, você receberá as instruções para redefinir sua senha em alguns minutos."
      });

      setIsLoading(false);

    } catch (error) {
      setApiResponse({
        success: false,
        error: "Erro de conexão",
        message: "Não foi possível enviar o e-mail. Verifique sua conexão e tente novamente."
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
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Esqueceu sua senha?</h1>
        <p className="text-gray-600 text-sm">
          Digite seu e-mail e enviaremos as instruções para redefinir sua senha
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {apiResponse && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${getMessageColor()}`}>
              <div className="flex-shrink-0 mt-0.5">
                {getMessageIcon()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {apiResponse.error ? "Erro ao enviar" : "E-mail enviado!"}
                </p>
                {apiResponse.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {apiResponse.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar instruções
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para login
        </Link>
      </div>

      {/* Additional info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h3 className="font-medium text-blue-900 text-sm mb-2">Não recebeu o e-mail?</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Verifique sua caixa de spam ou lixo eletrônico</li>
          <li>• Certifique-se de que o e-mail está correto</li>
          <li>• Aguarde até 10 minutos para o e-mail chegar</li>
          <li>• Entre em contato com o administrador se o problema persistir</li>
        </ul>
      </div>
    </div>
  );
}