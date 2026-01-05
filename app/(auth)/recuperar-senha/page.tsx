"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";

// Validação: Apenas o e-mail é necessário
const recoverSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type RecoverInputs = z.infer<typeof recoverSchema>;

export default function RecoverPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverInputs>({
    resolver: zodResolver(recoverSchema),
  });

  async function onSubmit(data: RecoverInputs) {
    setIsLoading(true);
    console.log("Solicitação de recuperação para:", data.email);
    
    // Simula o envio do e-mail
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  }

  // Se já enviou, mostra mensagem de sucesso em vez do formulário
  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h2>
        <p className="text-gray-600 mb-6">
          Enviamos as instruções de recuperação para o endereço informado.
        </p>
        <Link 
          href="/login" 
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          &larr; Voltar para o Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center text-xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
      <p className="text-center text-gray-600 text-sm mb-6">
        Digite seu e-mail para receber o link de redefinição.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail cadastrado</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="exemplo@clinica.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar Link"}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Lembrou a senha? <span className="text-blue-600">Entrar</span>
          </Link>
        </div>
      </form>
    </div>
  );
}