"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Olá! 👋 Sou o assistente virtual do Federal Invest. Como posso ajudá-lo hoje?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Respostas automáticas do bot
  const getAutomaticResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("ola") || message.includes("olá") || message.includes("oi")) {
      return "Olá! Como posso ajudá-lo com o Federal Invest? 😊";
    }
    
    if (message.includes("preço") || message.includes("preco") || message.includes("valor") || message.includes("custo")) {
      return "Nossos planos são personalizados de acordo com suas necessidades. Gostaria de agendar uma demonstração gratuita? 💰";
    }
    
    if (message.includes("funcionalidades") || message.includes("recursos") || message.includes("o que faz")) {
      return "O Federal Invest oferece:\n• Análise de DRE automatizada\n• Gestão de investimentos\n• Relatórios financeiros\n• Dashboard em tempo real\n• Controle de operações 📊";
    }
    
    if (message.includes("suporte") || message.includes("ajuda") || message.includes("problema")) {
      return "Nossa equipe de suporte está sempre disponível! Você pode:\n• Entrar em contato via WhatsApp\n• Enviar um email para suporte@federalinvest.com\n• Agendar uma chamada 🎧";
    }
    
    if (message.includes("demo") || message.includes("demonstração") || message.includes("teste")) {
      return "Perfeito! Você pode agendar uma demonstração gratuita clicando em 'Comece já' na página inicial. Nossa equipe entrará em contato em até 24h! 🚀";
    }
    
    if (message.includes("segurança") || message.includes("seguro") || message.includes("proteção")) {
      return "A segurança é nossa prioridade! Utilizamos:\n• Criptografia end-to-end\n• Servidores seguros\n• Backup automático\n• Conformidade com LGPD 🔒";
    }
    
    if (message.includes("obrigado") || message.includes("obrigada") || message.includes("valeu")) {
      return "De nada! Estou sempre aqui para ajudar. Precisa de mais alguma coisa? 😊";
    }
    
    // Resposta padrão
    return "Entendo sua pergunta! Para informações mais detalhadas, recomendo entrar em contato com nossa equipe especializada pelo WhatsApp ou agendar uma demonstração. Posso ajudar com algo mais? 🤔";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simular delay do bot
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutomaticResponse(inputText),
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente Virtual</h3>
            <p className="text-xs opacity-90">Federal Invest</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-2 ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              {message.isBot && (
                <div className="p-2 bg-blue-100 rounded-full self-end">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  message.isBot
                    ? "bg-gray-100 text-gray-800 rounded-bl-md"
                    : "bg-blue-600 text-white rounded-br-md"
                }`}
              >
                {message.text}
              </div>

              {!message.isBot && (
                <div className="p-2 bg-blue-100 rounded-full self-end">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="p-2 bg-blue-100 rounded-full">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot; 