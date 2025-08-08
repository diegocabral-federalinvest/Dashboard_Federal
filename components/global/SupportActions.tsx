"use client";

import React, { useState } from "react";
import WhatsAppIcon from "./whatsapp-chat-icon";
import ChatbotIcon from "./chatbot/ChatbotIcon";
import Chatbot from "./chatbot/Chatbot";

const SupportActions: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-4 items-center z-50">
      {/* Ícone do WhatsApp */}
      <WhatsAppIcon phoneNumber="5511999999999" />

      {/* Ícone do Chatbot */}
      <ChatbotIcon onClick={toggleChatbot} isOpen={isChatbotOpen} />

      {/* Chatbot */}
      {isChatbotOpen && (
        <div className="absolute bottom-20 right-0">
          <Chatbot onClose={toggleChatbot} />
        </div>
      )}
    </div>
  );
};

export default SupportActions;
