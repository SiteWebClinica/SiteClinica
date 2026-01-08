"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar  from "@/app/(admin)/components/Sidebar"; // Ajuste o caminho se sua Sidebar estiver em outro lugar

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Verifica se existe o "token" ou dados do usuário no navegador
    const storedUser = localStorage.getItem("clinica_user");

    if (!storedUser) {
      // 2. Se NÃO tiver usuário, chuta para o login imediatamente
      router.replace("/login"); 
      // Usamos 'replace' em vez de 'push' para ele não conseguir voltar com o botão "Voltar" do navegador
    } else {
      // 3. Se tiver usuário, libera a renderização da tela
      setIsAuthorized(true);
    }
  }, [router]);

  // Enquanto o useEffect verifica, mostramos nada (ou um Loading)
  // Isso evita que a dashboard "pisque" na tela antes de redirecionar
  if (!isAuthorized) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    );
  }

  // Se passou na verificação, mostra o Layout (Sidebar + Conteúdo)
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      {/* ADICIONEI 'pt-20' AQUI PARA O CONTEÚDO NÃO FICAR EMBAIXO DO HEADER */}
      <main className="flex-1 ml-0 p-8 pt-14 overflow-y-auto h-screen custom-scrollbar">
        {children}
      </main>
    </div>
  );
}