// app/(admin)/layout.tsx  — VERSÃO CORRIGIDA
// Problema: estava lendo "clinica_user" mas o login salva como "user"
// Corrigido para usar "user" consistentemente
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/(admin)/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // CORRIGIDO: chave "user" (igual ao que o login salva)
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 pt-20 overflow-y-auto h-screen custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
