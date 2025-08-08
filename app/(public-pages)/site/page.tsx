'use client';

import ContactSection from '@/components/global/contact-section';
import { InfiniteMovingCards } from '@/components/global/infinity-moving-cards';
import AboutCompany from '@/components/global/about-company';
import AboutSystem from '@/components/global/about-system';
import { ContainerScroll } from '@/components/global/container-scroll-animation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { generateFinancialGradient } from './parts';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDashboardClick = () => {
    setIsLoading(true);
    // Sempre redirecionar para sign-in
    router.push('/sign-in');
  };
  

  return (
    <main className=" text-white relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
            {/* Seção Hero com Animações */}
            <section className="relative h-[120vh] w-full flex flex-col items-center justify-start pb-[100px] neon-border">
        {/* Fundo com Gradiente e Linhas Dinâmicas */}
        <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-[#0b1338] to-[#101c44]"></div>
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          animate={{
            backgroundPosition: ['0% 0%', '50% 50%', '0% 100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="grid-lines"></div>
        </motion.div>

        {/* Gráficos Dinâmicos */}
        <div className="h-[1300px] w-full absolute inset-0 z-10 pointer-events-none opacity-90">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute neon-border ${
                Math.random() > 0.5 ? 'rounded-full' : 'rounded-2xl'
              } shadow-lg`}
              style={{
                width: `${Math.random() * 20 + 10}vw`,
                height: `${Math.random() * 15 + 5}vh`,
                top: `${Math.random() * 80}%`,
                left: `${-Math.random() * 40}vw`,
                background: generateFinancialGradient(),
                opacity: Math.random() * 0.5 + 0.5,
                boxShadow: `0px 0px ${Math.random() * 15 + 10}px rgba(0,0,0,0.2)`,
              }}
              animate={{
                x: ['0vw', '120vw'],
                opacity: [1, 0],
                rotate: [0, Math.random() * 45],
              }}
              transition={{
                duration: 6 + Math.random() * 6,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            ></motion.div>
          ))}
        </div>
        {/* Conteúdo Principal */}
        <ContainerScroll
          titleComponent={
            <div className="flex items-center flex-col">
              <div className="flex gap-4"> {/* Wrapper para os botões */}
              
                  <Button
                    size={'lg'}
                    onClick={handleDashboardClick}
                    disabled={isLoading || status === 'loading'}
                    className="p-8 mb-8 md:mb-0 text-2xl w-full sm:w-fit border-t-2 rounded-full border-[#4D4D4D] bg-[#0c0c0c] hover:bg-white group transition-all flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-neutral-500 duration-500"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-600 md:text-center font-sans group-hover:bg-gradient-to-r group-hover:from-black group-hover:to-black">
                      {isLoading ? "Carregando..." : "Comece já"}
                    </span>
                  </Button>
   
              </div>
              <h1 className="text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600 font-sans font-bold">
                Federal Invest System
              </h1>
              <p className="text-lg md:text-2xl text-neutral-500 text-center">
                Análise de DRE, gráficos e tabelas otimizadas para o sucesso da sua empresa.
              </p>
            </div>
          }
        />
      </section>

      {/* Seções Adicionais */}
      <section className="bg-gradient-to-br from-[#0b1338] via-gray-900 to-[#101c44] mt-16">
        <InfiniteMovingCards
          items={[
            { href: '/card1.jpg' },
            { href: '/card2.jpg' },
            { href: '/card3.jpg' },
            { href: '/card4.jpg' },
          ]}
          direction="left"
          speed="normal"
          pauseOnHover={true}
          className="mt-8"
        />
      </section>

      <AboutCompany />
      <AboutSystem />
      <ContactSection />

    </main>
  )
}
