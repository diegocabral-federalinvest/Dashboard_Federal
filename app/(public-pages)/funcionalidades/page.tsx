"use client";

import React from "react";
import { BarChart3, Table2, Banknote, Users, Coins, Calendar } from "lucide-react";
import PageHeader from "@/components/global/PageHeader";

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 size={50} className="text-blue-400" />,
      title: "Análise de DRE",
      description:
        "Visualize e analise o Demonstrativo de Resultados do Exercício (DRE) de forma detalhada.",
    },
    {
      icon: <Table2 size={50} className="text-blue-400" />,
      title: "Gráficos Interativos",
      description:
        "Explore gráficos interativos para entender melhor seus resultados financeiros.",
    },
    {
      icon: <Banknote size={50} className="text-blue-400" />,
      title: "Gerenciamento de Aportes",
      description:
        "Monitore e registre aportes financeiros para manter o controle de seus investimentos.",
    },
    {
      icon: <Users size={50} className="text-blue-400" />,
      title: "Gestão de Investidores",
      description:
        "Gerencie informações dos investidores e acompanhe seus retornos financeiros.",
    },
    {
      icon: <Coins size={50} className="text-blue-400" />,
      title: "Controle de Despesas",
      description:
        "Registre e acompanhe despesas e entradas de forma prática e organizada.",
    },
    {
      icon: <Calendar size={50} className="text-blue-400" />,
      title: "Planeje Despesas",
      description:
        "Planeja o quanto a sua empresa já gastou e ainda poderá gastar no mês.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1338] to-[#1f1f52] text-gray-200 flex flex-col">
      <PageHeader
        title="Funcionalidades"
        subtitle="Explore como as Funcionalidades do Sistema pode ajudar sua empresa."
      />

      {/* Lista de Funcionalidades */}
      <section className="relative py-16 px-8 neon-glow bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44]">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
          <div className="grid grid-cols-3 gap-4 h-full">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className={`bg-blue-${
                  index % 2 === 0 ? "400" : "300"
                } h-12 w-12 rounded-full blur-lg`}
              ></div>
            ))}
          </div>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 z-10 p-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-500 hover:scale-105 p-6 text-center
              border-2 border-gray-800 hover:border-4 hover:border-gray-600"
            >
              <div className="flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h2 className="text-2xl font-semibold text-blue-300 group-hover:text-white transition-colors">
                {feature.title}
              </h2>
              <p className="text-gray-300 mt-2">{feature.description}</p>
              <button className="mt-6 px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all">
                Saiba mais
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-[#0b1338] via-[#101c44] to-[#1a1a40] text-center neon-glow">
        <h2 className="text-4xl font-bold text-blue-300 p-4">
          Descubra todas as funcionalidades do sistema
        </h2>
        <p className="text-gray-300 mt-4">
          Obtenha controle total sobre suas finanças e tome decisões informadas.
        </p>
        <button className="mb-6 mt-6 px-6 py-3 bg-blue-800 text-white rounded-lg shadow-lg hover:bg-blue-900 transition-all">
          Comece Agora
        </button>
      </section>
    </div>
  );
};

export default FeaturesPage;
