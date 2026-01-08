"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react"; // Se não tiver lucide, avise que troco por texto

// Componente do Formulário (Lógica Principal)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pega o destino se existir (ex: /usuarios/pendentes)
  const redirectUrl = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Exibe erro (ex: Senha incorreta, Cadastro pendente)
        setError(data.error || "Ocorreu um erro ao entrar.");
        setLoading(false);
        return;
      }

      // === SUCESSO ===
      
      // 1. Salva os dados do usuário no navegador (para o Sidebar funcionar)
      localStorage.setItem("clinica_user", JSON.stringify(data.user));

      // 2. Redirecionamento Inteligente
      if (redirectUrl) {
        window.location.href = decodeURIComponent(redirectUrl);
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error(err);
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bem-vindo de volta</h1>
        <p className="text-gray-500 text-sm mt-2">Acesse sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Erro Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Input Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        {/* Input Senha */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Botão Entrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Entrando...
            </>
          ) : (
            "Acessar Sistema"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Não tem uma conta?{" "}
          <a href="/cadastro" className="text-teal-600 font-semibold hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
}

// === COMPONENTE PRINCIPAL (WRAPPER) ===
// Isso é obrigatório no Next.js quando usamos useSearchParams
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-teal-600">Carregando formulário...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}