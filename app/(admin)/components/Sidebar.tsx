import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Stethoscope,
  Users,
  DollarSign
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20 flex flex-col overflow-y-auto">
      {/* LOGO MUDOU DE COR */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-xl">
           {/* Ícone Teal */}
           <Stethoscope size={28} className="text-teal-600" />
           {/* Texto com acento Teal */}
           <span>Clinica<span className="text-teal-600">Sys</span></span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {/* Item Ativo agora é Teal */}
        <NavItem icon={Home} label="Início" href="/dashboard" active />
        <NavItem icon={Calendar} label="Agenda" href="/agenda" />
        <NavItem icon={Users} label="Clientes" href="/clientes" />
        <NavItem icon={ShoppingBag} label="Vendas e Orç." href="/vendas" />
        
        <NavGroup icon={Stethoscope} label="Atendimento" />
        <NavGroup icon={DollarSign} label="Financeiro" />
        <NavGroup icon={Package} label="Estoque" />
        <NavGroup icon={ClipboardList} label="Cadastros" />
        <NavGroup icon={Settings} label="Minha Clínica" />
        <NavGroup icon={FileText} label="Relatórios" />
        <NavItem icon={FileText} label="Fiscal" href="/fiscal" />
      </nav>

      <div className="p-4 border-t border-gray-100">
        {/* Botão de Ajuda agora é Índigo (Roxo azulado) */}
        <Link href="/ajuda" className="flex items-center gap-3 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors font-medium">
          <CircleHelp size={20} />
          <span>Ajuda</span>
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, href = "#", active = false }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          // Cor de fundo e texto do item ativo mudaram para Teal
          ? "bg-teal-50 text-teal-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({ icon: Icon, label }: any) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <ChevronDown size={14} className="text-gray-400" />
    </button>
  );
}