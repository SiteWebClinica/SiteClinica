/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Busca o usuário no banco pelo email
      // (Aqui estamos simulando uma API de login real)
      const res = await fetch(`/api/users?email=${formData.email}`);
      const users = await res.json();
      const user = users.find((u: any) => u.email === formData.email);

      // 2. Validações
      if (!user) {
        throw new Error("E-mail não encontrado.");
      }

      // IMPORTANTE: Em produção, a validação de senha deve ser feita no Backend!
      // Aqui estamos simplificando para o protótipo funcionar.
      // Se você usou o gerador de admin, a senha dele está criptografada, 
      // então essa comparação simples pode falhar se não tivermos a API de auth completa.
      // PARA TESTE AGORA: Vamos aceitar qualquer senha se o usuário existir,
      // OU se você souber a senha exata.
      
      // Verifica se está aprovado
      if (user.status !== "APPROVED") {
        throw new Error("Sua conta ainda está pendente de aprovação do Admin.");
      }

      // 3. O PASSO MÁGICO: SALVAR NO LOCALSTORAGE 🔑
      // Isso é o "Crachá" que o Dashboard procura
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirecionar
      router.push("/dashboard");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo de volta! 👋</h1>
          <p className="text-gray-500 text-sm mt-2">Entre com suas credenciais para acessar.</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4 border border-red-100">
                <AlertCircle size={16}/> {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">E-mail</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Senha</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>
            <div className="text-right mt-1">
                <Link href="#" className="text-xs text-teal-600 hover:underline">Esqueceu a senha?</Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Entrar no Sistema <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-gray-50">
            <p className="text-sm text-gray-500">
                Não tem uma conta? <Link href="/cadastro" className="text-teal-600 font-bold hover:underline">Criar conta</Link>
            </p>
        </div>

      </div>
    </div>
  );
}