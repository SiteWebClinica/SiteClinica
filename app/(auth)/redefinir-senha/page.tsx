"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

// Componente do Formulário
function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (password !== confirmPassword) {
      setStatus({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    if (!token) {
      setStatus({ type: "error", text: "Token inválido ou ausente." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus({ type: "success", text: "Senha alterada com sucesso! Redirecionando..." });
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <p className="text-red-500 text-center">Link inválido.</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Nova Senha</h1>
        
        {status && (
          <div className={`p-4 mb-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Salvar Nova Senha"}
          </button>
        </form>
    </div>
  );
}

// Página Principal
export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}