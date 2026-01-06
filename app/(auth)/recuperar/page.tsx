"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao solicitar recuperação.");
      }

      setMessage({ type: "success", text: "Verifique seu e-mail para redefinir a senha!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
          <p className="text-gray-500 text-sm mt-1">Informe seu e-mail para receber o link.</p>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enviar Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}