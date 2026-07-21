"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, Building2, CalendarDays, ChevronRight, ClipboardList,
  FileBadge, FileSignature, HelpCircle, LayoutDashboard, MessageSquareText,
  Package, Pill, ReceiptText, Settings, ShieldCheck, ShoppingBag, Users, WalletCards, X
} from "lucide-react";

const groups = [
  { label: "Operação", items: [
    { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/cadastros", label: "Cadastros", icon: ClipboardList },
    { href: "/vendas", label: "Vendas", icon: ShoppingBag },
  ]},
  { label: "Atendimento", items: [
    { href: "/atendimento/anamneses", label: "Anamneses", icon: ClipboardList },
    { href: "/atendimento/receituarios", label: "Receituários", icon: Pill },
    { href: "/atendimento/creditos", label: "Créditos de pacotes", icon: ShieldCheck },
    { href: "/atendimento/termos", label: "Termos", icon: FileSignature },
    { href: "/atendimento/atestados", label: "Atestados", icon: FileBadge },
    { href: "/atendimento/lembretes", label: "Comunicação", icon: MessageSquareText },
    { href: "/atendimento/sms", label: "Mensagens", icon: MessageSquareText },
  ]},
  { label: "Gestão", items: [
    { href: "/financeiro", label: "Financeiro", icon: WalletCards },
    { href: "/estoque", label: "Estoque", icon: Package },
    { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/fiscal", label: "Fiscal", icon: ReceiptText },
    { href: "/minha-clinica", label: "Minha clínica", icon: Building2 },
  ]},
];

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return <>
    {mobileOpen && <button aria-label="Fechar menu" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20"><Activity size={23} /></span>
          <span><strong className="block text-base tracking-tight text-slate-900">Clínica Sys</strong><small className="text-xs text-slate-400">Gestão inteligente</small></span>
        </Link>
        <button onClick={onClose} aria-label="Fechar menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X size={20} /></button>
      </div>
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {groups.map(group => <div key={group.label} className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{group.label}</p>
          <div className="space-y-1">{group.items.map(item => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={onClose} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={18} className={active ? "text-teal-600" : "text-slate-400 group-hover:text-teal-600"} />
              <span className="flex-1">{item.label}</span>{active && <ChevronRight size={15} />}
            </Link>;
          })}</div>
        </div>)}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <Link href="/usuarios/pendentes" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><ShieldCheck size={18} className="text-slate-400" />Usuários</Link>
        <Link href="/configuracoes" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><Settings size={18} className="text-slate-400" />Configurações</Link>
        <Link href="/ajuda" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><HelpCircle size={18} className="text-slate-400" />Ajuda</Link>
      </div>
    </aside>
  </>;
}
