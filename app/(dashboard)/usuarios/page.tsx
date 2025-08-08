import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRoleModalProvider } from "@/features/users/hooks/use-open-user-role";
import UsersClient from "./client";

export const metadata: Metadata = {
  title: "Usuários | Federal Invest",
  description: "Gestão de usuários e permissões",
};

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
      <UserRoleModalProvider>
        <UsersClient />
      </UserRoleModalProvider>
    </RoleGuard>
  );
}
