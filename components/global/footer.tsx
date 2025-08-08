"use client"
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bottom-0 py-5 left-0 right-0 bg-page-gradient backdrop-blur-lg z-50 border-2 border-y-[#000b6bc5] border-x-[#00073b] w-full  text-white neon-glow">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6">
        {/* Logo e Descrição */}
        <div className="text-center md:text-left p-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 text-transparent bg-clip-text">
            Federal Invest
          </h3>
          <p className="text-gray-300 text-sm max-w-md mt-2">
            Oferecendo soluções inovadoras para gestão financeira e análise de investimentos. Transformando seus objetivos financeiros em realidade.
          </p>
        </div>

        {/* Ícones Sociais */}
        <div className="flex gap-6">
          {[
            { href: '#', icon: <FaFacebook />, label: 'Facebook' },
            { href: '#', icon: <FaTwitter />, label: 'Twitter' },
            { href: '#', icon: <FaInstagram />, label: 'Instagram' },
          ].map(({ href, icon, label }, index) => (
            <motion.a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl text-gray-400 hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              aria-label={label}
            >
              {icon}
            </motion.a>
          ))}
        </div>

        {/* Direitos Reservados */}
        <div className="text-center md:text-right">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Federal Invest. <br /> Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
