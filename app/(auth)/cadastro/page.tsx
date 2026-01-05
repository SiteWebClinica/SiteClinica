"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";

// Schema simplificado: Só nome e email
const cadastroSchema = z.object({
  name: z.string().min(3, "O nome precisa ter pelo menos 3 letras"),
  email: z.string().email("Digite um e-mail válido"),
});

type CadastroInputs = z.infer<typeof cadastroSchema>;

export default function CadastroPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroInputs>({
    resolver: zodResolver(cadastroSchema),
  });

  async function onSubmit(data: CadastroInputs) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
        setIsLoading(false);
        return;
      }

      // Mensagem de sucesso atualizada
      alert("Solicitação enviada! Aguarde o administrador aprovar seu cadastro e enviar sua senha por e-mail.");
      window.location.href = "/login";

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold text-gray-800 mb-2">Solicitar Acesso</h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        Informe seus dados. O administrador criará sua senha.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input
            {...register("name")}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail corporativo</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 mt-4"
        >
          {isLoading ? "Enviando..." : "Solicitar Cadastro"}
        </button>

        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Voltar para o Login
          </Link>
        </div>
      </form>
    </div>
  );
}