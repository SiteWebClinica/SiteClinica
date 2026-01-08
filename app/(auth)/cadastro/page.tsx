"use client";

import { useState } from "react";
import { Send, User, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PublicRegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
        const res = await fetch("/api/auth/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) setSuccess(true);
        else alert("Erro ao solicitar. Email já cadastrado?");
    } catch (err) {
        alert("Erro de conexão.");
    } finally {
        setLoading(false);
    }
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h2>
                <p className="text-gray-600 mb-6">
                    O administrador irá analisar seu cadastro. Assim que aprovado, você receberá sua senha de acesso no email: <strong>{formData.email}</strong>.
                </p>
                <Link href="/login" className="text-teal-600 font-bold hover:underline">Voltar ao Login</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Solicitar Acesso</h1>
                <p className="text-gray-500 text-sm">Preencha seus dados para análise</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="text" placeholder="Seu Nome Completo" required className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-teal-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="email" placeholder="Seu E-mail Corporativo" required className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-teal-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    {loading ? "Enviando..." : <><Send size={18} /> Enviar Solicitação</>}
                </button>
            </form>
        </div>
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <Link href="/login" className="text-sm text-gray-600 hover:text-teal-600">Já tem acesso? Faça login</Link>
        </div>
      </div>
    </div>
  );
}