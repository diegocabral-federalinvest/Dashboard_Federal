'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

const AboutCompany: React.FC = () => {
  // Variantes para a animação do texto e imagem
const textVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 2 } },
};

const imageVariant: Variants = {
  hidden: { x: -300, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 3, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 3, ease: [0.25, 0.1, 0.25, 1] } },
};

  return (
    <section className="w-full bg-gradient-to-b from-[#0b1338] to-[#0f1e4b] text-white mt-8 p-4 neon-glow">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 text-transparent bg-clip-text mt-8">
            Sobre a Federal Invest
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Líder no mercado financeiro, oferecendo soluções inovadoras para gestão de investimentos e análise financeira.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row items-center gap-8"
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: false }} // O efeito será reativado sempre que a imagem voltar à viewport
          variants={imageVariant}
        >
          <div className="md:w-1/2 relative h-80 bg-gradient-to-r from-[#112240] via-[#153d6f] to-[#112240] rounded-lg shadow-2xl shadow-[#112240] group ">
            <Image
              src="/about1.jpg"
              alt="Sobre a Federal Invest"
              className="w-full h-full object-cover transition-transform duration-500 border-4 border-gray-500 rounded-2xl shadow-lg" 
              width={500} // Ajuste conforme necessário
              height={500}
            />
            <motion.div
    
        ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40 group-hover:opacity-60"></div>
          </div>
          <div className="md:w-1/2">
            <h3 className="text-3xl font-bold mb-4 text-blue-300">Nossa Missão</h3>
            <p className="text-lg text-gray-300">
              Proporcionar aos nossos clientes as melhores oportunidades de investimento através de análises precisas e estratégias
              personalizadas, visando o crescimento sustentável e a maximização dos retornos financeiros.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCompany;