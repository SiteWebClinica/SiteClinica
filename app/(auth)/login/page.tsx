"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível entrar.");
      localStorage.setItem("user", JSON.stringify(data));
      router.push(data.mustChangePassword ? "/primeiro-acesso" : "/dashboard");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível entrar."); }
    finally { setLoading(false); }
  }

  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
    <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-teal-600">Acesso seguro</p><h2 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h2><p className="mt-2 text-sm text-slate-500">Entre para acompanhar a rotina da clínica.</p></div>
    {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}
    <form onSubmit={submit} className="space-y-4">
      <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">E-mail</span><span className="relative block"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input type="email" autoComplete="email" required placeholder="nome@clinica.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" /></span></label>
      <label className="block"><span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">Senha<Link href="/recuperar" className="text-xs font-medium text-teal-600 hover:text-teal-700">Esqueci minha senha</Link></span><span className="relative block"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Sua senha" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-11 py-3 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
      <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : <>Entrar no sistema<ArrowRight size={18} /></>}</button>
    </form>
    <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">Ainda não tem acesso? <Link href="/cadastro" className="font-bold text-teal-600 hover:text-teal-700">Solicitar cadastro</Link></p>
  </div>;
}
