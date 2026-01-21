"use client";

import { Search, Bell, Send, Moon, LogOut, ChevronDown, User } from "lucide-react"; // 1. Adicionei os ícones novos aqui
import { usePathname, useRouter } from "next/navigation"; // 2. Adicionei useRouter
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter(); // 3. Hook para redirecionar
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 4. Estado do Menu

  useEffect(() => {
    const stored = localStorage.getItem("user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 5. Função de Logout
  function handleLogout() {
    if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem("user"); // Apaga o login
        router.push("/login");           // Manda pra tela de login
    }
  }

  // Esconde no login (mantive sua lógica de retorno antecipado aqui em baixo)
  if (pathname === "/login" || pathname === "/cadastro") return null;

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

        {/* 6. Perfil do Usuário com MENU DROPDOWN */}
        <div className="relative">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} // Alterna o menu
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all"
            >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0) || <User size={16}/>}
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-700 leading-none">
                        {user?.name?.split(" ")[0] || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {user?.email || "email@clinica.com"}
                    </p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}/>
            </button>

            {/* O MENU SUSPENSO (Abre ao clicar) */}
            {isMenuOpen && (
                <>
                    {/* Fundo invisível para fechar ao clicar fora */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    
                    {/* O Menu Flutuante */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 bg-gray-50">
                            <p className="text-xs font-bold text-gray-500">Logado como</p>
                            <p className="text-xs text-gray-800 truncate font-medium">{user?.email}</p>
                        </div>
                        
                        <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                            <User size={16} /> Meu Perfil
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors border-t border-gray-50"
                        >
                            <LogOut size={16} /> Sair do Sistema
                        </button>
                    </div>
                </>
            )}
        </div>

      </div>
    </header>
  );
}