"use client";

import Image from "next/image";
import React from "react";
import PageHeader from "@/components/global/PageHeader";
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1338] to-[#1f1f52] text-gray-200 flex flex-col">
      <PageHeader
        title="Sobre Nossa Empresa"
        subtitle="Conheça nossa história, missão e valores que movem nossa paixão em ajudar empresas a alcançar o sucesso."
      />

      {/* Nossa História */}
      <section className="mt-12 px-8 py-16 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-lg shadow-2xl shadow-gray-600  
      mx-8 flex flex-col md:flex-row items-center gap-8 border-2 border-gray-700">
        <div className="w-full md:w-1/2">
          <h2 className="text-4xl font-semibold mb-6 text-[#e6e6e6]">
            Nossa História
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            A Federal Invest nasceu com o objetivo de oferecer soluções financeiras personalizadas
            e eficientes para empresas e investidores. Com mais de 10 anos de experiência, somos
            apaixonados por inovação e resultados.
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <Image
            src="/card1.jpg"
            alt="Nossa História"
            className="rounded-lg w-full border-4 border-gray-700 shadow-2xl shadow-gray-600 hover:scale-105 transition-transform duration-500"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* Valores e Missão */}
      <section className="mt-16 px-8 py-16 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-lg shadow-md mx-8 neon-glow">
        <h2 className="text-4xl font-semibold mb-6 text-[#e6e6e6]">
          Missão, Visão e Valores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-blue-300">Missão</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Proporcionar soluções financeiras que impulsionem o crescimento sustentável de nossos
              clientes.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-blue-300">Visão</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Ser referência no mercado financeiro pela excelência e inovação.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-blue-300">Valores</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Transparência, ética, inovação e foco nos resultados.
            </p>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="mt-16 px-8 py-16 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-lg shadow-md mx-8 neon-glow mb-16">
        <h2 className="text-4xl font-semibold mb-6 text-[#e6e6e6]">
          Nossa Equipe
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <p className="text-lg text-gray-300 leading-relaxed md:w-2/3">
            Contamos com uma equipe de profissionais qualificados, prontos para ajudar sua empresa
            a alcançar novos patamares de sucesso.
          </p>
          <div className="grid grid-cols-2 gap-4 md:w-1/3">
            {["card2.jpg", "card3.jpg", "card4.jpg", "card1.jpg"].map(
              (src, index) => (
                <Image
                  key={index}
                  src={`/${src}`}
                  alt={`Membro da Equipe ${index + 1}`}
                  className="rounded-lg shadow-lg border-4 border-gray-700 hover:scale-105 transition-transform duration-500"
                  width={300}
                  height={300}
                />
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
