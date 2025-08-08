// src/pages/HowItWorkPage.tsx

"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone } from "lucide-react";
import PageHeader from "@/components/global/PageHeader";

const HowItWorkPage: React.FC = () => {

  return (
  
        <div className="min-h-screen bg-gradient-to-br from-[#0b1338] to-[#1f1f52] text-gray-200 flex flex-col">
      <PageHeader
        title="Aprenda usar o Sistema Financeiro"
        subtitle="   Aqui você encontra tudo o que precisa para utilizar o sistema de forma eficiente."
      />

      {/* Instruções e Vídeo */}
      <section className="flex flex-col items-center justify-center px-8 py-12 bg-[#252550] rounded-lg shadow-lg mx-8 neon-glow">
        <h2 className="text-5xl font-semibold mb-6">Instruções Passo a Passo</h2>
        <div className="w-full md:w-3/4 h-56 bg-black rounded-lg flex items-center justify-center">
          {/* Substitua pelo vídeo */}
          <p className="text-gray-400  text-xl">[Play]</p>
        </div>
        <p className="mt-4 text-gray-300  text-xl">
          Assista ao vídeo acima para aprender a utilizar todas as funcionalidades do sistema.
        </p>
      </section>

      {/* Funcionalidades Principais */}
      <section className="mt-12 px-8 py-12 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44]  rounded-lg shadow-lg mx-8 neon-glow">
        <h2 className="text-5xl font-semibold mb-6">Principais Funcionalidades</h2>
        <ul className="space-y-4 text-gray-300">
          <li>
            <strong>Aportes:</strong> Saiba como realizar aportes e acompanhar seus investimentos.
          </li>
          <li>
            <strong>Cadastro de Despesas e Entradas:</strong> Registre suas despesas e entradas para um melhor controle financeiro.
          </li>
          <li>
            <strong>Dashboard:</strong> Visualize gráficos e resumos atualizados dos investimentos e rendimentos.
          </li>
          <li>
            <strong>DRE:</strong> Acesse o Demonstrativo de Resultados do Exercício com resumos mensais e trimestrais.
          </li>
          <li>
            <strong>Exportação de Dados:</strong> Exporte seus dados em PDF, imagem ou CSV para análise externa.
          </li>
        </ul>
      </section>
      {/* Perguntas Frequentes */}
      <section className="mt-12 px-8 py-12 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44]  rounded-lg shadow-lg mx-8 mb-8 neon-glow">
        <h2 className="text-5xl font-semibold mb-6">Perguntas Frequentes</h2>
        <Accordion type="single" collapsible className="w-full md:w-3/4 mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-2xl font-semibold text-gray-200">
              Como faço para realizar um aporte?
            </AccordionTrigger>
            <AccordionContent className="text-gray-300 text-xl">
              No menu lateral, clique em &quot;Investidores&quot; --ícone de usuário-- e clique em &quot;Adicionar Aporte&quot;. Selecione um investidor. 
              Clique no botão de adicionar aporte e preencha os detalhes do aporte. 
              Preencha as informações e salve.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-2xl font-semibold text-gray-200">
            Como cadastro uma nova despesa ou entrada?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400  text-xl">
              Acesse pelo menu lateral a opção de &quot;Operações&quot; --ícone de dinheiro com seta-- e clique em Gerenciar Despesas ou Entradas. 
              Aqui vocé pode criar novas despesas ou entradas e visualizar a tabela de despesas disponível, realizando filtragens e ordenações.
              É possível tambem editar e deletar qualquer uma delas, indo na tabela, clicando no 3 pontinhos na linha desejada e escolher as opções de editar ou deletar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-2xl font-semibold text-gray-200">
            Como posso visualizar os investimentos no dashboard?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400  text-xl">
            Acesse pelo menu lateral a opção de &quot;Investidores&quot; e após selecionar um investidor poderá ver informações sobre seus investimentos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-2xl font-semibold text-gray-200">
              O sistema suporta exportação de dados?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400  text-xl">
              Sim, você pode exportar relatórios no formato CSV, PDF ou PNG diretamente do DRE.
              Acesse pelo menu lateral a opçao de &quot;DRE&quot; procure o ícone de download.
              Selecione o formato desejado e clique em &quot;Exportar&quot; para iniciar a exportação.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Rodapé */}
      <footer className="mt-auto py-4 text-center text-gray-400">
        <p>Sistema desenvolvido para gerenciar sua empresa com eficiência. © 2024</p>
      </footer>
    </div>
  );
};

export default HowItWorkPage;
