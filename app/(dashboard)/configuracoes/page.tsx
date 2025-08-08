import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import ConfiguracoesClient from "./client";

export const metadata: Metadata = {
  title: "Configurações | Federal Invest",
  description: "Configurações do sistema",
};

export default function ConfiguracoesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <ConfiguracoesClient />
    </RoleGuard>
  );
} 