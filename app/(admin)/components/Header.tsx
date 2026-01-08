"use client";

import { Search, Bell, Send, Moon, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Esconde no login
  if (pathname === "/login" || pathname === "/cadastro") return null;

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-40">
      
      {/* LUPA (Barra de Pesquisa) */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full flex">
            <input 
                type="text" 
                placeholder="Busque por nomes ou dados..." 
                className="w-full pl-4 pr-12 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:border-teal-500 text-sm text-gray-600 bg-gray-50/50"
            />
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors">
                <Search size={18} />
            </button>
        </div>
      </div>

      {/* ÍCONES DA DIREITA */}
      <div className="flex items-center gap-5">
        
        {/* Ícones de ação */}
        <div className="flex items-center gap-4 text-gray-400">
            <button className="hover:text-teal-600"><Moon size={20} /></button>
            <button className="hover:text-teal-600"><Send size={20} /></button>
            <button className="hover:text-teal-600 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
        </div>

        {/* Divisória */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-700 leading-none">
                    {user?.name?.split(" ")[0] || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {user?.email || "email@clinica.com"}
                </p>
            </div>
        </div>

      </div>
    </header>
  );
}