"use client";

import React from "react";
import { MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppIconProps {
  phoneNumber: string;
  message?: string;
}

const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ 
  phoneNumber, 
  message = "Olá! Gostaria de saber mais sobre o Federal Invest." 
}) => {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      <button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden"
        title="Fale conosco no WhatsApp"
      >
        {/* Ícone principal */}
        <MessageCircle className="w-6 h-6" />
        
        {/* Efeito de pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
          }}
        />
      </button>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          WhatsApp Suporte
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default WhatsAppIcon; 