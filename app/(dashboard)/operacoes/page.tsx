import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import OperacoesClient from "./client";

export const metadata: Metadata = {
  title: "Operações | Federal Invest",
  description: "Gestão de operações financeiras e transações",
};

export default function OperacoesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "EDITOR", "VIEWER"]}>
      <OperacoesClient />
    </RoleGuard>
  );
} 

