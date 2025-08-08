import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import DREClient from "./client-refactored";

export const metadata: Metadata = {
  title: "Demonstrativo de Resultados do Exercício | Federal Invest",
  description: "Visualize o desempenho financeiro através do Demonstrativo de Resultados do Exercício (DRE).",
};

export default function DREPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
      <DREClient />
    </RoleGuard>
  );
}