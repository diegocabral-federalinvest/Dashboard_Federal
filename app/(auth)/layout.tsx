"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-100/40 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Logo space */}


            {/* Form container with glassmorphism effect */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-blue-900/10 p-8">
              {children}
            </div>
          </div>
        </div>

        {/* Right side - Decorative panel */}
        <div className="hidden lg:flex lg:flex-1 lg:relative">
          <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-lg"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full blur-md transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 text-center text-white max-w-md">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Gestão Financeira Completa</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Gerencie seus investimentos, controle despesas e receitas, e acompanhe relatórios DRE em uma plataforma moderna e segura.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-100">Dashboard interativo e personalizado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-100">Relatórios DRE automatizados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-100">Gestão completa de investidores</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-blue-100">Segurança e controle de acesso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
