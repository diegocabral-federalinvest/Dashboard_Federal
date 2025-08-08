// src/app/(main)/(pages)/(public-pages)/layout.tsx

import React from 'react';
import Navbar from '@/components/global/navbar';
import Footer from '@/components/global/footer';
//import WhatsAppChatIcon from '@/components/global/whatsapp-chat-icon2';
import SupportActions from "@/components/global/SupportActions";
type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <div className="w-full overflow-y-auto">
      <main className="absolute inset-0 h-full w-full bg-gradient-to-b from-[#0b1338] to-[#101c44] mt-16">
      <Navbar />
      {children}
      <Footer />
      <SupportActions />
      </main>
    </div>
  );
};

export default Layout;
