"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";

export default function PrimeiroAcessoPage() {
  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pega o usuário que acabou de logar
    const stored = localStorage.getItem("clinica_user");
    if (stored) setUser(JSON.parse(stored));
    else window.location.href = "/login";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          newPassword: password 
        }),
      });

      if (res.ok) {
        // Atualiza o localStorage para desligar o aviso
        user.mustChangePassword = false;
        localStorage.setItem("clinica_user", JSON.stringify(user));
        
        alert("Senha atualizada! Bem-vindo ao sistema.");
        window.location.href = "/dashboard";
      } else {
        alert("Erro ao atualizar senha.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-yellow-400">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">👋 Olá, {user.name}!</h1>
        <p className="text-gray-600 text-sm mb-6">
          Como este é seu primeiro acesso, precisamos que você troque sua senha temporária por uma definitiva.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nova Senha Pessoal</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="******" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="******" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : "Salvar e Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}