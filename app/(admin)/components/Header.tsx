"use client";

import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StoredUser = { name?: string; email?: string; userType?: string };
const titles: Record<string, string> = { dashboard: "Visão geral", agenda: "Agenda", clientes: "Clientes", vendas: "Vendas e orçamentos", financeiro: "Financeiro", estoque: "Estoque", relatorios: "Relatórios", fiscal: "Fiscal", configuracoes: "Configurações", ajuda: "Central de ajuda" };

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const frame = requestAnimationFrame(() => {
      if (stored) try { setUser(JSON.parse(stored) as StoredUser); } catch { setUser({}); }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const title = titles[segment] || segment.replaceAll("-", " ");

  async function logout() {
    try { await fetch("/api/logout", { method: "POST" }); } finally {
      localStorage.removeItem("user"); router.replace("/login");
    }
  }

  return <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
    <button onClick={onMenuClick} aria-label="Abrir menu" className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={22} /></button>
    <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">Clínica Sys</p><h1 className="truncate text-lg font-bold capitalize text-slate-900">{title}</h1></div>
    <div className="ml-auto hidden w-full max-w-sm items-center md:flex">
      <Search className="pointer-events-none relative left-9 text-slate-400" size={17} />
      <input aria-label="Busca global" placeholder="Buscar cliente, agenda ou venda..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white" />
    </div>
    <button aria-label="Notificações" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"><Bell size={20} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-slate-100">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-sm font-bold text-white">{user.name?.charAt(0).toUpperCase() || <UserRound size={17} />}</span>
        <span className="hidden text-left xl:block"><strong className="block max-w-32 truncate text-xs text-slate-800">{user.name || "Usuário"}</strong><small className="block text-[10px] capitalize text-slate-400">{user.userType || "Equipe"}</small></span>
        <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
      </button>
      {open && <><button aria-label="Fechar menu do usuário" onClick={() => setOpen(false)} className="fixed inset-0 z-40" /><div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        <div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-semibold text-slate-800">{user.name || "Usuário"}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div>
        <button onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"><LogOut size={17} />Sair do sistema</button>
      </div></>}
    </div>
  </header>;
}
