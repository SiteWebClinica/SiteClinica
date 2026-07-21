"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar o link.");
      setMessage({ ok: true, text: "Se este e-mail estiver cadastrado e aprovado, enviaremos as instruções de recuperação." });
    } catch (err) { setMessage({ ok: false, text: err instanceof Error ? err.message : "Erro de conexão." }); }
    finally { setLoading(false); }
  }

  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
    <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600"><Mail size={23} /></span><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-teal-600">Recuperação de acesso</p><h2 className="text-3xl font-bold text-slate-900">Esqueceu a senha?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Informe o e-mail utilizado no cadastro e enviaremos um link seguro.</p>
    {message && <div className={`mt-5 flex gap-2 rounded-xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{message.ok && <CheckCircle2 size={18} className="shrink-0" />}{message.text}</div>}
    <form onSubmit={submit} className="mt-6 space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail</span><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@clinica.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" /></label><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : "Enviar link de recuperação"}</button></form>
    <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600"><ArrowLeft size={16} />Voltar ao login</Link>
  </div>;
}
