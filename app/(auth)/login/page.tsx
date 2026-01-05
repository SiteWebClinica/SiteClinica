"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";

// Regras de validação (Schema)
const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInputs) {
    setIsLoading(true);
    // Simulação de envio para o servidor
    console.log("Enviando dados:", data);
    
    setTimeout(() => {
      alert(`Login simulado com sucesso!\nEmail: ${data.email}`);
      setIsLoading(false);
    }, 1500);
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold text-gray-800 mb-6">Acesse sua conta</h2>
      
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
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        {/* Links Rodapé */}
        <div className="flex justify-between text-sm mt-4">
          <Link href="/recuperar-senha" className="text-blue-600 hover:text-blue-500">
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