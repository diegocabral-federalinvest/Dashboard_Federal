//src/app/investidor/dashboard/[id]/page.tsx
import { Metadata } from "next";
import InvestorDashboardClient from "./client";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Dashboard do Investidor | Federal Invest",
  description: "Acompanhe seus investimentos e rendimentos em tempo real no Federal Invest",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvestorDashboardPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={["INVESTOR"]}>
      <div className="p-3">
        <InvestorDashboardClient investorId={id} />
      </div>
    </RoleGuard>
  );
} 