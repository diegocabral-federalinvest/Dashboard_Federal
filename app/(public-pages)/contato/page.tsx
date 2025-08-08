"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Send,
  MessageCircle,
} from "lucide-react";
import PageHeader from "@/components/global/PageHeader";
const ContactPage: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    const encodedMessage = encodeURIComponent(`Dúvida enviada pelo sistema: ${message}`);
    window.open(`https://wa.me/YOUR_PHONE_NUMBER?text=${encodedMessage}`, "_blank"); // Substitua pelo seu número do WhatsApp
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1338] to-[#1f1f52] text-gray-200 flex flex-col">
           <PageHeader
        title="Entre em Contato"
        subtitle="Fale conosco e descubra como podemos ajudar sua empresa."
      />

      {/* Formulário de Contato */}
      <section className="neon-glow flex flex-col items-center px-8 py-12 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-2xl shadow-lg mx-8 border-2 border-cyan-600 ">
        <h2 className="text-3xl font-semibold mb-6 p-8">Envie-nos uma Mensagem</h2>
        <textarea
          className="w-full neon-border md:w-3/4 h-32 placeholder:text-gray-400 placeholder:italic placeholder:text-base placeholder:pt-2 placeholder:pl-4 bg-[#474786] text-gray-200 rounded-md outline-none border-2 border-gray-600 focus:border-blue-400"
          placeholder="Digite sua dúvida ou mensagem aqui..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex mt-6 gap-4">
          <Button
            className="bg-green-700 hover:bg-green-800 px-6 py-3 rounded-2xl shadow-md flex items-center gap-2"
            onClick={handleSendMessage}
          >
            <Send size={20} /> Enviar via WhatsApp
          </Button>
          <Button
            className="bg-blue-800 hover:bg-blue-900 px-6 py-3 rounded-2xl shadow-md flex items-center gap-2"
            onClick={() => window.open("https://wa.me/YOUR_PHONE_NUMBER", "_blank")}
          >
            <Phone size={20} /> Ligar para Suporte
          </Button>
        </div>
        <p className="mt-4 text-gray-400 text-sm">
          Nossa equipe de suporte está pronta para ajudá-lo.
        </p>
      </section>

      {/* Redes Sociais */}
      <section className="mt-12 px-8 py-12 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44]  rounded-2xl shadow-lg mx-8 neon-glow">
        <h2 className="text-3xl font-semibold mb-6">Nossas Redes Sociais</h2>
        <div className="flex items-center justify-center gap-8">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-full hover:bg-blue-600 transition-all duration-300 neon-glow"
          >
            <Twitter size={32} className="text-blue-400" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-full hover:bg-red-900 transition-all duration-300 neon-glow"
          >
            <Instagram size={32} className="text-red-500" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-full hover:bg-blue-700 transition-all duration-300 neon-glow"
          >
            <Facebook size={32} className="text-blue-500" />
          </a>
          <a
            href="mailto:contato@federalinvest.com"
            className="p-4 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-full hover:bg-gray-500 transition-all duration-300 neon-glow"
          >
            <Mail size={32} className="text-gray-400" />
          </a>
        </div>
      </section>

      {/* Informações de Contato */}
      <section className="mt-12 px-8 py-10 bg-gradient-to-b from-[#0b1338] via-gray-900 to-[#101c44] rounded-2xl shadow-lg mx-8 neon-glow mb-12">
        <h2 className="text-3xl font-semibold mb-6">Outros Contatos</h2>
        <div className="space-y-6 text-lg">
          <div className="flex items-center gap-4">
            <Mail size={24} className="text-blue-400 neon-border" />
            <p className="text-gray-300">contato@federalinvest.com</p>
          </div>
          <div className="flex items-center gap-4">
            <Phone size={24} className="text-blue-400 neon-border" />
            <p className="text-gray-300">+55 (11) 1234-5678</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
