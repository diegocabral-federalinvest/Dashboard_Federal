"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logger from "@/lib/logger";

export default function ConfiguracoesClient() {
  logger.info("Página de configurações carregada");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie configurações globais do Federal Invest
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
          <p className="text-muted-foreground">
            Página em desenvolvimento. Configurações do sistema serão disponibilizadas em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
