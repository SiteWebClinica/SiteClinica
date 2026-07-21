"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send, UserRound } from "lucide-react";

export default function CadastroPage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/cadastro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar a solicitação.");
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro de conexão."); }
    finally { setLoading(false); }
  }

  if (success) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5"><span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={32} /></span><p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Solicitação enviada</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Agora é com a gente</h2><p className="mt-3 text-sm leading-6 text-slate-500">A administração analisará o cadastro de <strong className="text-slate-700">{form.email}</strong>. Você receberá as orientações de acesso por e-mail.</p><Link href="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"><ArrowLeft size={17} />Voltar ao login</Link></div>;

  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
    <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-teal-600">Novo acesso</p><h2 className="text-3xl font-bold text-slate-900">Solicite seu cadastro</h2><p className="mt-2 text-sm leading-6 text-slate-500">Preencha seus dados profissionais. A administração da clínica aprovará o acesso.</p>
    {error && <div className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Nome completo</span><span className="relative block"><UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input required minLength={3} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Como devemos chamar você?" className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" /></span></label>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail profissional</span><span className="relative block"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nome@clinica.com" className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" /></span></label>
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : <><Send size={18} />Enviar solicitação</>}</button>
    </form>
    <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600"><ArrowLeft size={16} />Já tenho acesso</Link>
  </div>;
}
