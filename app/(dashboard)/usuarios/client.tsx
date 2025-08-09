"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, UserCog, Mail, Shield, ShieldAlert, UserPlus, UserCheck, AlertCircle, Trash2, Edit, Filter, X, Lock } from "lucide-react";
import { EnhancedTable } from "@/components/ui/enhanced-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InviteUserModal } from "./components/invite-user-modal";
import { ChangePasswordModal } from "./components/change-password-modal";
import { UserRoleProvider } from "@/features/users/components/user-role-provider";
import { useOpenUserRole } from "@/features/users/hooks/use-open-user-role";
import { createId } from "@paralleldrive/cuid2";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from 'next-auth/react';
import { useSearchParams } from "next/navigation";
import { useHeaderContent } from "@/hooks/use-header-content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logger from "@/lib/frontend-logger";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  lastLogin: string | null;
  createdAt: string;
  isAllowed: boolean;
};

type InvitationData = {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  role: string;
  type: string;
};

interface UserFilters {
  email: string;
  role: string;
  status: string;
}

export default function UsersClient() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedUserForPasswordChange, setSelectedUserForPasswordChange] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    email: "",
    role: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const { onOpen } = useOpenUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const searchParams = useSearchParams();
  
  // Set header content
  useHeaderContent({
    title: "Usuários",
    subtitle: "Gestão completa de usuários e convites"
  });
  
  // Check for URL parameter to open the invite modal automatically
  useEffect(() => {
    if (searchParams?.get("open_invite") === "true") {
      setIsInviteModalOpen(true);
    }
  }, [searchParams]);

  // Fetch users data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json() as Promise<UserData[]>;
    },
  });

  // Fetch pending invitations data
  const { data: invitations, isLoading: isLoadingInvites } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const response = await fetch("/api/invitations");
      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }
      return response.json() as Promise<InvitationData[]>;
    },
  });

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    if (!users) return { roles: [], statuses: [] };
    
    const roles = Array.from(new Set(users.map(user => user.role).filter(Boolean))).sort();
    const statuses = [
      { value: "active", label: "Ativo" },
      { value: "blocked", label: "Bloqueado" }
    ];
    
    return { roles, statuses };
  }, [users]);

  // Filter users based on current filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesEmail = filters.email === "" || 
        user.email.toLowerCase().includes(filters.email.toLowerCase()) ||
        (user.name?.toLowerCase() || "").includes(filters.email.toLowerCase());
      const matchesRole = filters.role === "" || user.role === filters.role;
      const matchesStatus = filters.status === "" || 
        (filters.status === "active" && user.isAllowed) ||
        (filters.status === "blocked" && !user.isAllowed);
      
      return matchesEmail && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete user");
        } catch (parseError) {
          throw new Error(`Failed to delete user (${response.status}): ${response.statusText}`);
        }
      }
      
      return response.json();
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update user role");
        } catch (parseError) {
          throw new Error(`Failed to update user role (${response.status}): ${response.statusText}`);
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user access mutation
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, allow }: { userId: string; allow: boolean }) => {
      const response = await fetch(`/api/users/${userId}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: allow }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user access");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Acesso atualizado",
        description: "O acesso do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar acesso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel invitation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao cancelar convite: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to resend invitation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao reenviar convite: ${error.message}`,
        variant: "destructive",
      });
    },
  });



  // Clear filters
  const clearFilters = () => {
    setFilters({ email: "", role: "", status: "" });
  };

  // Check if any filter is active
  const hasActiveFilters = filters.email || filters.role || filters.status;

  // Format role for display
  const formatRole = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return <Badge variant="default" className="bg-red-500">Admin</Badge>;
      case "EDITOR":
        return <Badge variant="default" className="bg-purple-500">Editor</Badge>;
      case "INVESTOR":
        return <Badge variant="default" className="bg-blue-500">Investidor</Badge>;
      case "VIEWER":
        return <Badge variant="outline">Visualizador</Badge>;
      default:
        return role;
    }
  };

  // Check if current user is super admin (reserved emails)
  const isSuperAdmin = () => {
    if (sessionStatus !== "authenticated") return false;
    const protectedAdminEmails = [
      "pedro-eli@hotmail.com",
      "diego.cabral@federalinvest.com.br"
    ];
    return protectedAdminEmails.includes(session?.user?.email?.toLowerCase() || "");
  };

  // Check if user is protected
  const isProtectedUser = (email: string) => {
    const protectedAdminEmails = [
      "pedro-eli@hotmail.com",
      "diego.cabral@federalinvest.com.br"
    ];
    return protectedAdminEmails.includes(email.toLowerCase());
  };

  // Check if user is current user
  const isCurrentUser = (email: string) => {
    return session?.user?.email === email;
  };

  // Check if current user is ADMIN
  const isCurrentUserAdmin = () => {
    if (sessionStatus !== "authenticated") return false;
    // First, get current user's role from the users list
    const currentUserData = users?.find(user => user.email === session?.user?.email);
    return currentUserData?.role?.toLowerCase() === "admin";
  };

  // Handle opening change password modal
  const handleChangePassword = (userId: string, userEmail: string) => {
    setSelectedUserForPasswordChange({ id: userId, email: userEmail });
    setIsChangePasswordModalOpen(true);
  };

  // Handle closing change password modal
  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setSelectedUserForPasswordChange(null);
  };

  // Columns for users table
  const userColumns: ColumnDef<UserData>[] = [
    {
      id: "name",
      header: "Nome",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.name || "Sem nome"}</span>
          {isCurrentUser(row.original.email) && (
            <Badge variant="outline" className="text-xs">Você</Badge>
          )}
          {isProtectedUser(row.original.email) && (
            <Badge variant="secondary" className="text-xs">Protegido</Badge>
          )}
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Função",
      accessorKey: "role",
      cell: ({ row }) => formatRole(row.original.role || "VIEWER"),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isAllowed ? "default" : "destructive"}>
          {row.original.isAllowed ? "Ativo" : "Bloqueado"}
        </Badge>
      ),
    },
    {
      id: "lastLogin",
      header: "Último Login",
      accessorKey: "lastLogin",
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin 
          ? format(new Date(row.original.lastLogin), "dd/MM/yyyy HH:mm", { locale: ptBR })
          : "Nunca";
        return lastLogin;
      },
    },
    {
      id: "createdAt",
      header: "Criado em",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "dd/MM/yyyy", { locale: ptBR });
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const isProtected = isProtectedUser(row.original.email);
        const isSelf = isCurrentUser(row.original.email);
        const isAdmin = isCurrentUserAdmin();
        // Only ADMINs can modify roles, with additional restrictions for protected users
        const canModify = isAdmin && ((isProtected && isSuperAdmin()) || (!isProtected && !isSelf));
        const canDelete = !isProtected && !isSelf;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <UserCog className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => {
                  console.log('Clicou em Alterar função para usuário:', row.original.id, row.original.email);
                  onOpen(row.original.id);
                }}
                disabled={!canModify}
              >
                <Edit className="h-4 w-4 mr-2" />
                Alterar função
              </DropdownMenuItem>
              
              {/* Only show change password option if current user is ADMIN */}
              {isCurrentUserAdmin() && (
                <DropdownMenuItem
                  onClick={() => handleChangePassword(row.original.id, row.original.email)}
                  disabled={!canModify}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </DropdownMenuItem>
              )}
              
              {/* Only show block/unblock access option if current user is NOT ADMIN */}
              {!isCurrentUserAdmin() && (
                <DropdownMenuItem
                  onClick={() => toggleAccessMutation.mutate({
                    userId: row.original.id,
                    allow: !row.original.isAllowed
                  })}
                  disabled={isProtected || isSelf}
                >
                  {row.original.isAllowed ? (
                    <>
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Bloquear acesso
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Permitir acesso
                    </>
                  )}
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir usuário
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o usuário <strong>{row.original.email}</strong>?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate(row.original.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Columns for invitations table
  const invitationColumns: ColumnDef<InvitationData>[] = [
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Função",
      accessorKey: "role",
      cell: ({ row }) => formatRole(row.original.role),
    },
    {
      id: "type",
      header: "Tipo",
      accessorKey: "type",
      cell: ({ row }) => {
        switch (row.original.type.toUpperCase()) {
          case "INVESTOR":
            return <Badge variant="secondary">Investidor</Badge>;
          case "NORMAL":
          default:
            return <Badge variant="outline">Padrão</Badge>;
        }
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => resendInvitationMutation.mutate(row.original.id)}
            title="Reenviar convite"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Cancelar convite"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar convite</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar o convite para <strong>{row.original.email}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => cancelInvitationMutation.mutate(row.original.id)}
                >
                  Sim, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const isLoading = isLoadingUsers || isLoadingInvites;

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 space-y-6 p-4 md:p-6">
      <UserRoleProvider />
      <InviteUserModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
      
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
        userId={selectedUserForPasswordChange?.id || ""}
        userEmail={selectedUserForPasswordChange?.email || ""}
      />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 border-blue-200" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>
        <Button
          size="lg"
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Convidar Novo Usuário
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-500" />
              Filtros de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-email">Email/Nome</Label>
                <Input
                  id="filter-email"
                  placeholder="Digite email ou nome..."
                  value={filters.email}
                  onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="filter-role">Função</Label>
                <Select
                  value={filters.role || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, role: value === "all" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as funções" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    {uniqueValues.roles
                      .filter((role): role is string => typeof role === "string" && role !== null)
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-status">Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {uniqueValues.statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Users */}
        <Card className="shadow-md border-t-4 border-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" /> 
                  Usuários do Sistema 
                  {filteredUsers.length !== users?.length && (
                    <Badge variant="outline" className="ml-2">
                      {filteredUsers.length} de {users?.length || 0}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários que possuem acesso à plataforma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <EnhancedTable
                columns={userColumns}
                data={filteredUsers || []}
                searchColumn="email"
                searchPlaceholder="Buscar por email..."
                enableFiltering={false}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
              />
            )}
          </CardContent>
        </Card>

        {/* Invitations */}
        <Card className="shadow-md border-t-4 border-amber-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-amber-500" /> Convites Pendentes
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie os convites enviados para novos usuários
                </CardDescription>
              </div>
              <div className="flex gap-2">
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : invitations && invitations.length > 0 ? (
              <EnhancedTable
                columns={invitationColumns}
                data={invitations.filter(inv => inv.status === "PENDING") || []}
                searchColumn="email"
                searchPlaceholder="Buscar por email..."
                enableFiltering={false}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-md">
                <Mail className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p>Nenhum convite pendente</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Enviar Convite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 