"use client";

import { Bell, Search, Send, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  
  // Estado inicial (placeholder enquanto carrega)
  const [user, setUser] = useState({ 
    name: "Carregando...", 
    initials: "...", 
    role: "Visitante" 
  });

  useEffect(() => {
    // Busca os dados salvos no navegador
    const storedUser = localStorage.getItem("clinica_user");
    
    if (storedUser) {
      const data = JSON.parse(storedUser);
      
      // 1. Pega o primeiro nome + sobrenome (se tiver)
      const nameParts = data.name.split(" ");
      const displayName = nameParts.length > 1 
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` // Ex: Joao Silva
        : nameParts[0]; // Ex: Joao

      // 2. Gera as iniciais (Ex: Joao Silva -> JS)
      const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].slice(0, 2).toUpperCase();

      // 3. Traduz o cargo (ADMIN -> Administrador)
      const displayRole = data.role === "ADMIN" ? "Administrador" : "Colaborador";

      setUser({
        name: displayName,
        initials: initials,
        role: displayRole
      });
    }
  }, []);

  // Função para deslogar (bônus!)
  function handleLogout() {
    localStorage.removeItem("clinica_user");
    router.push("/login");
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 px-6 flex items-center justify-between">
      
      {/* BARRA DE BUSCA */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <input
            type="text"
            placeholder="Busque por nomes ou dados..."
            className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all text-sm"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-teal-600 text-white rounded-full w-10 flex items-center justify-center hover:bg-teal-700 transition-colors">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* ÍCONES E PERFIL */}
      <div className="flex items-center gap-4 ml-6">
        
        <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
            <ActionButton icon={Send} />
            <ActionButton icon={Bell} badge={3} />
        </div>

        {/* Perfil do Usuário (Agora Dinâmico) */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-full pr-3 transition-colors group relative">
            
            {/* Avatar com Iniciais */}
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm tracking-wide">
                {user.initials}
            </div>
            
            {/* Nome e Cargo */}
            <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-700 leading-none mb-1">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {user.role}
                </p>
            </div>

            {/* Menu Dropdown de Logout (Aparece ao passar o mouse) */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
               >
                 <LogOut size={16} />
                 Sair do Sistema
               </button>
            </div>

        </div>

      </div>
    </header>
  );
}

function ActionButton({ icon: Icon, badge }: any) {
    return (
        <button className="relative w-9 h-9 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full flex items-center justify-center transition-all">
            <Icon size={20} />
            {badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
        </button>
    )
}