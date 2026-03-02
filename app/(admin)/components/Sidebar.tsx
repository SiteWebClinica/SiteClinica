"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingBag,
  MessageCircle,
  DollarSign,
  Package,
  FileEdit,
  Building2,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  ShieldCheck,
  Activity,
  ChevronDown,
  ClipboardList,
  Pill,
  FileSignature,
  FileBadge,
  Send,
  Bell,
} from "lucide-react";

export default function Sidebar() {
  // ==========================================
  // 1. TODOS OS HOOKS PRIMEIRO (Sempre no topo!)
  // ==========================================
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // AQUI: Declarei os estados dos submenus logo no início!
  const [isVendasOpen, setIsVendasOpen] = useState(false);
  const [isAtendimentoOpen, setIsAtendimentoOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // ==========================================
  // 2. AGORA SIM AS CONDICIONAIS DE RETORNO
  // ==========================================

  // Esconde no login/cadastro
  if (pathname === "/login" || pathname === "/cadastro") return null;

  // Evita erro de hidratação (opcional, mas bom manter)
  if (!mounted) return null;

  // ==========================================
  // 3. Funções auxiliares e Renderização
  // ==========================================
  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all mb-1
    ${
      isActive(path)
        ? "text-teal-600 bg-teal-50"
        : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
    }
  `;

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 font-sans">
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-teal-600">
          <Activity size={28} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-gray-800">
            Clinica <span className="text-teal-600">Sys</span>
          </span>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard size={18} /> Início
        </Link>

        <Link href="/agenda" className={linkClass("/agenda")}>
          <Calendar size={18} /> Agenda
        </Link>

        <Link href="/clientes" className={linkClass("/clientes")}>
          <Users size={18} /> Clientes
        </Link>

        {/* MENU: VENDAS E ORÇAMENTOS */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setIsVendasOpen(!isVendasOpen)}
            className={`w-full flex items-center justify-between cursor-pointer ${linkClass("/vendas").replace('mb-1', '')}`} // tirei o mb-1 base para gerenciar o espaço no submenu
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} />
              <span>Vendas e Orçamentos</span>
            </div>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 text-gray-400 ${isVendasOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {isVendasOpen && (
            <div className="flex flex-col gap-1 ml-6 mt-1 border-l-2 border-gray-100 pl-4 mb-2">
              <Link href="/vendas/nova" className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors">
                Nova Venda
              </Link>
              <Link href="/vendas/orcamentos" className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors">
                Orçamentos
              </Link>
              <Link href="/vendas/historico" className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors">
                Histórico de Vendas
              </Link>
            </div>
          )}
        </div>

        {/* MENU: ATENDIMENTO */}
        <div className="flex flex-col">
          <div
            onClick={() => setIsAtendimentoOpen(!isAtendimentoOpen)}
            className={`${linkClass("#")} justify-between cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={18} />
              Atendimento
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isAtendimentoOpen ? "rotate-180" : ""}`}
            />
          </div>

          {isAtendimentoOpen && (
            <div className="flex flex-col gap-1 mt-1 ml-6 pl-4 border-l-2 border-gray-100 mb-2">

              <Link
                href="/atendimento/anamneses"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <ClipboardList size={16} /> Anamneses
              </Link>

              <Link
                href="/atendimento/receituarios"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <Pill size={16} /> Receituários
              </Link>

              <Link
                href="/atendimento/creditos"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <Package size={16} /> Créditos de Pacotes
              </Link>

              <Link
                href="/atendimento/termos"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <FileSignature size={16} /> Termos de Consentimento
              </Link>

              <Link
                href="/atendimento/atestados"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <FileBadge size={16} /> Atestados
              </Link>

              <Link
                href="/atendimento/sms"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <Send size={16} /> Envio de SMSs
              </Link>

              <Link
                href="/atendimento/lembretes"
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-[#00acc1] hover:bg-teal-50/50 rounded-md px-2 transition-colors"
              >
                <Bell size={16} /> Lembretes
              </Link>
            </div>
          )}
        </div>

        <Link href="/financeiro" className={linkClass("/financeiro")}>
          <div className="flex items-center gap-3">
            <DollarSign size={18} /> Financeiro
          </div>
        </Link>

        <div className={linkClass("#") + " justify-between cursor-pointer"}>
          <div className="flex items-center gap-3">
            <Package size={18} /> Estoque
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className={linkClass("#") + " justify-between cursor-pointer"}>
          <div className="flex items-center gap-3">
            <FileEdit size={18} /> Cadastros
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className={linkClass("#") + " justify-between cursor-pointer"}>
          <div className="flex items-center gap-3">
            <Building2 size={18} /> Minha Clínica
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className={linkClass("#") + " justify-between cursor-pointer"}>
          <div className="flex items-center gap-3">
            <BarChart3 size={18} /> Relatórios
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <Link href="/fiscal" className={linkClass("/fiscal")}>
          <FileText size={18} /> Fiscal
        </Link>

        {/* ÁREA DO ADMIN */}
        {user?.userType === "admin" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Administração
            </p>

            {/* Link corrigido para a tela de aprovação que criamos */}
            <Link href="/admin/users" className={linkClass("/admin/users")}>
              <ShieldCheck size={18} /> Aprovações
            </Link>

            <Link href="/configuracoes" className={linkClass("/configuracoes")}>
              <Settings size={18} /> Configurações
            </Link>
          </div>
        )}

        <div className="mt-2">
          <Link
            href="/ajuda"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-pink-500 hover:bg-pink-50 rounded-lg"
          >
            <HelpCircle size={18} /> Ajuda
          </Link>
        </div>
      </nav>
    </aside>
  );
}