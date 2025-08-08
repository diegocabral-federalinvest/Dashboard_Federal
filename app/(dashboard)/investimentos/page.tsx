import { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import InvestmentsClient from "./client";

export const metadata: Metadata = {
  title: "Investimentos | Federal Invest",
  description: "Gestão de investidores e aportes financeiros",
};

export default function InvestmentsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "EDITOR"]}>
      <InvestmentsClient />
    </RoleGuard>
  );
} 