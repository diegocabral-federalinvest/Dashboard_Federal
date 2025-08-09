"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, User, Mail, MapPin, Calendar as CalendarDateIcon, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import logger from "@/lib/logger";
import { toast } from "sonner";

const investorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;

interface InvestorRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InvestorRegistrationModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: InvestorRegistrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      address: "",
    },
  });

  const onSubmit = async (data: InvestorFormData) => {
    setIsLoading(true);
    setRegistrationStatus('idle');
    
    try {
      console.log("🔍 [FRONTEND] Dados do formulário (raw):", data);
      
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        city: data.city || null,
        address: data.address || null,
      };
      
      console.log("📤 [FRONTEND] Payload que será enviado:", JSON.stringify(payload, null, 2));
      
      logger.info("Cadastrando novo investidor:", JSON.stringify(payload));

      // 1. Criar o investidor
      const investorResponse = await fetch("/api/investors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // 🔑 CRUCIAL: Incluir cookies de sessão do NextAuth
        body: JSON.stringify(payload),
      });

      if (investorResponse.ok) {
        const result = await investorResponse.json();

        
        // Mostrar mensagem baseada no status do convite
        let toastMessage = result.message || "Investidor cadastrado com sucesso!";
        
        if (result.invitationStatus === "ALREADY_EXISTS") {
          toast.success(toastMessage, {
            description: "O convite já foi enviado anteriormente. O investidor pode verificar seu email.",
            duration: 6000,
          });
        } else if (result.invitationStatus === "CREATED") {
          toast.success(toastMessage, {
            description: "Um convite foi enviado por email para o investidor criar sua conta.",
            duration: 5000,
          });
        } else if (result.invitationStatus === "FAILED") {
          toast.success("Investidor cadastrado!", {
            description: "Houve um problema no envio do convite, mas o investidor foi cadastrado com sucesso. Você pode reenviar o convite manualmente.",
            duration: 7000,
          });
        } else {
          toast.success(toastMessage);
        }
        
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        const errorData = await investorResponse.json().catch(() => ({}));
        console.error("❌ [FRONTEND] Erro ao criar investidor:", {
          status: investorResponse.status,
          statusText: investorResponse.statusText,
          errorData
        });
        
        // Mensagens de erro mais específicas
        let errorMessage = "Erro ao cadastrar investidor";
        
        if (investorResponse.status === 400) {
          if (errorData.error?.includes("email")) {
            errorMessage = "Este email já está cadastrado como investidor";
          } else if (errorData.details) {
            // Erros de validação Zod
            const validationErrors = Array.isArray(errorData.details) 
              ? errorData.details.map((err: any) => err.message).join(", ")
              : "Dados inválidos";
            errorMessage = `Erro de validação: ${validationErrors}`;
          } else {
            errorMessage = errorData.error || "Dados inválidos";
          }
        } else if (investorResponse.status === 401) {
          errorMessage = "Você não tem permissão para cadastrar investidores. Faça login novamente.";
        } else if (investorResponse.status === 500) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns instantes.";
        } else {
          errorMessage = errorData.error || `Erro ${investorResponse.status}: ${investorResponse.statusText}`;
        }
        
        toast.error("Erro no cadastro", {
          description: errorMessage,
          duration: 5000,
        });
      }

    } catch (error) {
      logger.error("Erro no cadastro do investidor:", error instanceof Error ? error.message : String(error));
      setRegistrationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setRegistrationStatus('idle');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Cadastrar Novo Investidor
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo investidor e permita o acesso ao sistema
          </DialogDescription>
        </DialogHeader>

        {registrationStatus === 'success' && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✓ Cadastrado com sucesso
              </Badge>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Investidor cadastrado e convite enviado! Ele pode criar conta no sistema agora.
            </p>
          </div>
        )}

        {registrationStatus === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                ✗ Erro no cadastro
              </Badge>
            </div>
            <p className="text-sm text-red-700 mt-2">
              Ocorreu um erro ao cadastrar o investidor. Tente novamente.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="João da Silva"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="joao@exemplo.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        type="tel"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Cidade (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="São Paulo"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua das Flores, 123"
                        {...field}
                        disabled={isLoading}
                        className="focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Após o cadastro, o investidor receberá permissão para criar conta no sistema 
                e poderá acessar seu dashboard individual de investimentos.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Investidor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 