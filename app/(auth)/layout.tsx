import { Activity, CalendarCheck2, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#f5f7fa] lg:grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,.34),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(232,93,117,.22),transparent_32%)]" />
      <div className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500"><Activity size={25} /></span><div><strong className="block text-lg">Clínica Sys</strong><span className="text-xs text-slate-400">Gestão que cuida junto com você</span></div></div>
      <div className="relative my-auto max-w-xl">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-teal-200"><Sparkles size={14} />Tudo em um só lugar</span>
        <h1 className="text-4xl font-bold leading-tight xl:text-5xl">Mais tempo para cuidar. Menos tempo organizando.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Agenda, prontuários, financeiro e relacionamento com pacientes em uma experiência simples para toda a equipe.</p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarCheck2 className="mb-3 text-teal-300" /><strong className="block text-sm">Rotina organizada</strong><span className="text-xs text-slate-400">Visão completa do dia</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-3 text-rose-300" /><strong className="block text-sm">Acesso protegido</strong><span className="text-xs text-slate-400">Dados da clínica seguros</span></div>
        </div>
      </div>
      <p className="relative text-xs text-slate-500">© 2026 Clínica Sys</p>
    </section>
    <section className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><Activity size={22} /></span><strong className="text-lg text-slate-900">Clínica Sys</strong></div>
        {children}
      </div>
    </section>
  </main>;
}
