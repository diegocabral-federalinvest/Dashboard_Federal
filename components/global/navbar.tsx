'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Menu as MenuIcon, X as XIcon, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';


const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = () => {
    if (status === 'loading') return;

    if (session?.user) {
      // Usuário logado - vai para o dashboard
      router.push('/');
    } else {
      // Usuário não logado - vai para login
      router.push('/sign-in?redirect_url=' + encodeURIComponent('/'));
    }
  };

  return (
       <header
      className={`fixed top-0 left-0 right-0 z-50 border-2 border-y-[#000b6bc5] border-x-[#00073b] ${
        isScrolled
          ? "backdrop-blur-lg bg-transparent"
          : "bg-gradient-to-r from-[#0e1025c5] via-gray-900 to-[#000425] backdrop-blur-lg"
      } transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center absolute left-5">
              <Image
                src="/logo.svg"
                alt="Logo"
                className="max-h-12 w-auto hidden lg:block"
                width={32}
                height={32}
              />
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 mx-auto items-center justify-center">
            <Link href="/aprenda-usar" className="text-white hover:text-gray-300 transition">
              Aprenda a Usar
            </Link>
            <Link href="/sobre" className="text-white hover:text-gray-300 transition">
              Sobre
            </Link>
            <Link href="/funcionalidades" className="text-white hover:text-gray-300 transition">
              Funcionalidades
            </Link>
            <Link href="/servicos" className="text-white hover:text-gray-300 transition">
              Serviços
            </Link>
            <Link href="/contato" className="text-white hover:text-gray-300 transition">
              Contato
            </Link>
          </div>

          <div className="flex items-center absolute right-0 mr-4 gap-6">
         
              <Link href="/ajuda">
                <HelpCircle className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer transition-transform transform hover:scale-110 right-4" />
              </Link>
       

            <button
              onClick={handleNavigation}
              className="w-[100px] relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                {session?.user ? "Dashboard" : "Login"}
              </span>
            </button>

            <button
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-page-gradient backdrop-blur-lg border-t-2 border-[#00073b]">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <li>
              <Link
                href="/como-usar"
                className="text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Aprenda a Usar a Plataforma
              </Link>
            </li>
            <li>
              <Link
                href="/sobre"
                className="text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre
              </Link>
            </li>
            <li>
              <Link
                href="/funcionalidades"
                className="text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Funcionalidades
              </Link>
            </li>
            <li>
              <Link
                href="/servicos"
                className="text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Serviços
              </Link>
            </li>
            <li>
              <Link
                href="/contato"
                className="text-white hover:text-gray-300 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contato
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
