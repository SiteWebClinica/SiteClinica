"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- Importante para redirecionar
import { Loader2 } from "lucide-react"; // Ícone de carregamento bonitinho

// Regras de validação (Schema)
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"), // Mudei para min(1) pois senhas temporárias podem ser curtas
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter(); // Hook de navegação
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Para mostrar erros na tela

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInputs) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. CHAMA A API REAL
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao fazer login");
      }

      // 2. SALVA O USUÁRIO NO NAVEGADOR
      // Isso permite que outras páginas saibam quem está logado
      localStorage.setItem("clinica_user", JSON.stringify(result.user));

      // 3. DECIDE PARA ONDE IR (A Lógica do Primeiro Acesso) 🚦
      if (result.user.mustChangePassword) {
        // Se a API disse que precisa trocar a senha:
        router.push("/primeiro-acesso");
      } else {
        // Se está tudo normal:
        router.push("/dashboard");
      }

    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold text-gray-800 mb-6">Acesse sua conta</h2>
      
      {/* Exibe erro se houver (ex: Senha incorreta) */}
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Campo E-mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            {...register("email")}
            type="email"
            placeholder="admin@clinica.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Campo Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            {...register("password")}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Botão Entrar */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Verificando...
            </div>
          ) : (
            "Entrar"
          )}
        </button>

        {/* Links Rodapé */}
        <div className="flex justify-between text-sm mt-4">
          <Link href="/recuperar" className="text-blue-600 hover:text-blue-500">
            Esqueci a senha
          </Link>
          <Link href="/cadastro" className="text-blue-600 hover:text-blue-500">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}