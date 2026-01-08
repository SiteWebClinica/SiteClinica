import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/(admin)/components/Sidebar";
import Header from "@/app/(admin)/components/Header"; // <--- IMPORTANTE

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clinica Sys",
  description: "Sistema de Gestão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        
        {/* Menu Lateral */}
        <Sidebar />
        
        {/* Barra Superior (Lupa) */}
        <Header />

        {/* Conteúdo da Página (Ajustado com margem para não ficar embaixo do menu) */}
        <main className="ml-64 pt-16 bg-gray-50 min-h-screen">
          {children}
        </main>
        
      </body>
    </html>
  );
}