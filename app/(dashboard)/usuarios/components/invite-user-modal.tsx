"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, ShieldCheck, UserPlus, Loader2 } from "lucide-react";

// Form schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"], {
    required_error: "Selecione uma função",
  }),
  type: z.enum(["NORMAL", "INVESTOR"], {
    required_error: "Selecione um tipo de convite",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "VIEWER",
      type: "NORMAL",
    },
  });

  // Create invitation mutation
  const createInviteMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      setIsPending(true);
      try {
        const invitationPayload = {
          email: data.email,
          role: data.role,
          type: data.type,
        };
        
        console.log("Sending invitation data:", invitationPayload);
        
        const response = await fetch("/api/invitations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invitationPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Erro ao criar convite");
        }

        return await response.json();
      } finally {
        setIsPending(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Convite enviado",
        description: "O convite foi enviado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createInviteMutation.mutate(data);
  };

  const inviteType = form.watch("type");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
            Convidar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite para um novo usuário acessar a plataforma. O usuário receberá um email com instruções para criar sua conta.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Usuário</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="usuario@exemplo.com" {...field} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    O email deve ser válido para que o usuário possa receber o convite
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Convite - AGORA ANTES da função */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Convite</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={(val) => {
                      field.onChange(val);
                      if (val === "INVESTOR") {
                        form.setValue("role", "INVESTOR", { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NORMAL">Padrão</SelectItem>
                      <SelectItem value="INVESTOR">Investidor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha &quot;Investidor&quot; se o usuário deverá ter acesso aos dados financeiros
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Função do Usuário - depois do tipo; desabilita quando for INVESTOR */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função do Usuário</FormLabel>
                  <Select
                    disabled={isPending || inviteType === "INVESTOR"}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN" className="flex items-center">
                        <div className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                          <span>Administrador</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="EDITOR">
                        <div className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-purple-500" />
                          <span>Editor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="INVESTOR">
                        <div className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Investidor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="VIEWER">
                        <div className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Visualizador</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define os níveis de acesso do usuário na plataforma
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 