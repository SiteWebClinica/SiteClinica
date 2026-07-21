"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

function Form() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage(null);
    if (password.length < 8) return setMessage({ ok: false, text: "A senha precisa ter pelo menos 8 caracteres." });
    if (password !== confirm) return setMessage({ ok: false, text: "As senhas não coincidem." });
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword: password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível alterar a senha.");
      setMessage({ ok: true, text: "Senha atualizada. Você já pode entrar." });
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) { setMessage({ ok: false, text: err instanceof Error ? err.message : "Erro de conexão." }); }
    finally { setLoading(false); }
  }

  if (!token) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5"><LockKeyhole className="mx-auto text-rose-500" size={38} /><h2 className="mt-4 text-2xl font-bold text-slate-900">Link inválido</h2><p className="mt-2 text-sm text-slate-500">Solicite um novo link de recuperação para continuar.</p><Link href="/recuperar" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-600"><ArrowLeft size={16} />Solicitar novo link</Link></div>;

  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"><span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600"><LockKeyhole size={23} /></span><p className="text-xs font-bold uppercase tracking-wider text-teal-600">Proteja sua conta</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Crie uma nova senha</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use pelo menos 8 caracteres e evite informações fáceis de adivinhar.</p>
    {message && <div className={`mt-5 flex gap-2 rounded-xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{message.ok && <CheckCircle2 size={18} />}{message.text}</div>}
    <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Nova senha<span className="relative mt-1.5 block"><input type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-teal-500" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 p-1 text-slate-400">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label className="block text-sm font-semibold text-slate-700">Confirme a senha<input type={show ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" /></label><button disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : "Salvar nova senha"}</button></form>
  </div>;
}

export default function Page() { return <Suspense fallback={<div className="text-center text-sm text-slate-500">Validando link...</div>}><Form /></Suspense>; }
