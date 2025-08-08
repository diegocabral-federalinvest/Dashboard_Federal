"use client";

import { useSession } from "next-auth/react";

type WelcomeMsgProps = {
  isAdmin?: boolean;
};

export const WelcomeMsg = ({ isAdmin }: WelcomeMsgProps) => {
  const { data: session } = useSession();
  
  return (
    <div className="space-y-2 mb-4">
      <h2 className="text-3xl text-white font-medium">
        Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ""}!
      </h2>
      <p className="text-white/70">
        {isAdmin ? "Gerencie sua plataforma Federal Invest" : "Acesse suas informações financeiras"}
      </p>
    </div>
  );
};