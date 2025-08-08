"use client";

import React from "react";
import { Briefcase, TrendingUp, Shield, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import PageHeader from "@/components/global/PageHeader";

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <Briefcase size={48} className="text-blue-400" />,
      title: "Consultoria Financeira",
      description:
        "Receba orientação especializada para otimizar suas finanças e maximizar lucros.",
    },
    {
      icon: <TrendingUp size={48} className="text-blue-400" />,
      title: "Planejamento Estratégico",
      description:
        "Elaboramos planos personalizados para garantir o crescimento sustentável da sua empresa.",
    },
    {
      icon: <BarChart size={48} className="text-blue-400" />,
      title: "Gestão de Investimentos",
      description:
        "Monitoramos e gerenciamos seus investimentos para obter os melhores resultados.",
    },
    {
      icon: <Shield size={48} className="text-blue-400" />,
      title: "Proteção Patrimonial",
      description:
        "Proteja o patrimônio da sua empresa com estratégias inovadoras e seguras.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1338] to-[#1f1f52] text-gray-200 flex flex-col">
      <PageHeader
        title="Nossos Serviços"
        subtitle="  Descubra como podemos ajudar sua empresa a alcançar o próximo nível."
      />


     {/* Lista de Serviços */}
<section className="relative py-16 px-8 border-2 border-gray-700 shadow-2xl shadow-gray-800">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10">
    {services.map((service, index) => (
      <Card
        key={index}
        className="border-4 neon-glow group flex flex-col justify-between bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-lg shadow-lg hover:shadow-xl transform transition-transform duration-500 hover:scale-105 p-6 text-center"
        style={{ minHeight: "320px" }}
      >
        <CardHeader>
          <div className="flex flex-col items-center mb-4">
            {service.icon}
            <CardTitle className="text-2xl font-semibold text-blue-300 group-hover:text-white transition-colors">
              {service.title}
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              {service.description}
            </CardDescription>
          </div>
        </CardHeader>
        <div>
          <Button className="w-[70%] mb-4 mx-auto p-4 px-4 py-4 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition-all">
            Saiba mais
          </Button>
        </div>
      </Card>
    ))}
  </div>
</section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-[#0b1338] via-[#101c44] to-[#1a1a40] text-center neon-glow p-16">
        <h2 className="text-4xl font-bold text-blue-300 p-8">
          Transforme seu negócio agora mesmo
        </h2>
        <p className="text-gray-300 mt-4 p-4">
          Entre em contato e descubra como nossos serviços podem impulsionar o
          sucesso da sua empresa.
        </p>
        <button className="mb-6 px-6 py-3 bg-blue-700 text-white rounded-lg shadow-lg hover:bg-blue-800 transition-all p-4">
          Entre em Contato
        </button>
      </section>
    </div>
  );
};

export default ServicesPage;
