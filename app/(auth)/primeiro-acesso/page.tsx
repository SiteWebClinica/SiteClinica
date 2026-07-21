"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";

type User = { id: number; name: string; email: string; userType: string; mustChangePassword?: boolean };

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const frame = requestAnimationFrame(() => {
      if (!stored) { router.replace("/login"); return; }
      try { setUser(JSON.parse(stored) as User); } catch { router.replace("/login"); }
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    if (password.length < 8) return setMessage("Use pelo menos 8 caracteres.");
    if (password !== confirm) return setMessage("As senhas não coincidem.");
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, newPassword: password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível atualizar.");
      const updated = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updated));
      router.replace("/dashboard");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Erro de conexão."); }
    finally { setLoading(false); }
  }

  if (!user) return <div className="text-center text-sm text-slate-500">Preparando seu acesso...</div>;
  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"><span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><LockKeyhole size={23} /></span><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Primeiro acesso</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Olá, {user.name.split(" ")[0]}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Antes de continuar, troque a senha temporária por uma senha pessoal e segura.</p>
    {message && <div className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</div>}
    <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Nova senha<input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" /></label><label className="block text-sm font-semibold text-slate-700">Confirme a senha<input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500" /></label><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : <><CheckCircle2 size={18} />Salvar e entrar</>}</button></form>
  </div>;
}
