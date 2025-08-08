"use client";

import React from "react";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatbotIconProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick, isOpen }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      <button
        onClick={onClick}
        className={`${
          isOpen 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-blue-500 hover:bg-blue-600"
        } text-white p-4 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden`}
        title={isOpen ? "Fechar Chat" : "Abrir Assistente Virtual"}
      >
        {/* Ícone com animação de rotação */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "bot"}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Bot className="w-6 h-6" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Efeito de pulse quando fechado */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.42, 0, 0.58, 1],
            }}
          />
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          {isOpen ? "Fechar Chat" : "Assistente Virtual"}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </div>
      
      {/* Indicador de atividade */}
      {!isOpen && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
          }}
        />
      )}
    </motion.div>
  );
};

export default ChatbotIcon; 