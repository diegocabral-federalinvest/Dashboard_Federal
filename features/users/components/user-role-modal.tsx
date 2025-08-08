"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useOpenUserRole } from "../hooks/use-open-user-role";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for form validation
const formSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "INVESTOR", "VIEWER"]),
});

type FormValues = z.infer<typeof formSchema>;

// API hook to update user role (only database)
const useUpdateUserRole = (userId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormValues) => {
      if (!userId) throw new Error("User ID is required");
      
      // Update role in database only
      const dbResponse = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: data.role }),
      });
      
      if (!dbResponse.ok) {
        try {
          const errorData = await dbResponse.json();
          throw new Error(errorData.error || "Failed to update user role");
        } catch (parseError) {
          throw new Error(`Failed to update user role (${dbResponse.status}): ${dbResponse.statusText}`);
        }
      }
      
      return await dbResponse.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar função",
        description: `${error.message}`,
        variant: "destructive",
      });
      console.error("Error updating user role:", error);
    },
  });
};

export function UserRoleModal() {
  const { isOpen, userId, onClose } = useOpenUserRole();
  const updateRoleMutation = useUpdateUserRole(userId);
  const { toast } = useToast();

  // Debug logs


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "VIEWER",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  function onSubmit(values: FormValues) {
    updateRoleMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  const isPending = form.formState.isSubmitting || updateRoleMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar função do usuário</DialogTitle>
          <DialogDescription>
            Escolha a função apropriada para este usuário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="INVESTOR">Investidor</SelectItem>
                      <SelectItem value="VIEWER">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 