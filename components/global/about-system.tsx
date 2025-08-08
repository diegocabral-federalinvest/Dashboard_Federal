'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaTable,
  FaMoneyCheck,
  FaUsers,
  FaDollarSign,
  FaRegCalendarAlt,
} from 'react-icons/fa';;
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  Table2,
  Banknote,
  Users,
  Coins,
  Calendar,
} from 'lucide-react';

const AboutSystem: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 size={50} className="text-blue-400" />,
      title: 'Análise de DRE',
      description: 'Realize análises detalhadas do Demonstrativo de Resultados do Exercício (DRE).',
    },
    {
      icon: <Table2 size={50} className="text-blue-400" />,
      title: 'Gráficos e Tabelas',
      description: 'Visualize dados financeiros através de gráficos interativos e tabelas personalizadas.',
    },
    {
      icon: <Banknote size={50} className="text-blue-400" />,
      title: 'Gerenciamento de Aportes',
      description: 'Insira e gerencie aportes financeiros de forma simples e eficiente.',
    },
    {
      icon: <Users size={50} className="text-blue-400" />,
      title: 'Gerenciamento de Investidores',
      description: 'Gerencie investidores e acompanhe o desempenho de seus investimentos.',
    },
    {
      icon: <Coins size={50} className="text-blue-400" />,
      title: 'Controle de Despesas e Entradas',
      description: 'Gerencie despesas e entradas financeiras com facilidade.',
    },
    {
      icon: <Calendar size={50} className="text-blue-400" />,
      title: 'Previsões de Impostos',
      description: 'Planeje melhor as finanças da sua empresa com previsões de impostos.',
    },
  ];

  return (
    <section className="w-screen bg-gradient-to-b from-[#0b1338] to-[#101c44] text-white py-16 px-6  neon-glow">
      <div className="max-w-screen mx-auto neon-glow  p-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 text-transparent bg-clip-text p-8">
            Sobre o Nosso Sistema
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Nosso sistema oferece ferramentas avançadas para otimizar a gestão financeira da sua empresa.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
            >
<Card className="group relative bg-gradient-to-b from-[#0b1338] to-[#101c44] shadow-lg rounded-lg transition-transform transform hover:scale-105 p-4 mr-4 ml-4 ">
  {/* Borda Neon Animada */}
  <div className="absolute inset-0 border-[3px] border-transparent rounded-lg neon-border before:absolute before:inset-0 before:rounded-lg before:animate-glow p-2"></div>

  <CardHeader className="relative z-10 flex flex-col items-center text-center p-4">
    {feature.icon}
    <h3 className="mt-4 text-2xl font-semibold text-blue-300">{feature.title}</h3>
  </CardHeader>
  <CardContent className="relative z-10 mt-2 text-gray-100">
    {feature.description}
  </CardContent>
</Card>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSystem;