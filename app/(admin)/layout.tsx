import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
// 1. Importe o fundo
import { AnimatedBackground } from "./components/AnimatedBackground";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removi o bg-gray-50 daqui porque o fundo animado já cuida disso
    <div className="min-h-screen font-sans text-gray-900 flex relative">
      
      {/* 2. Adicione o fundo aqui, ANTES de tudo */}
      <AnimatedBackground />

      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Área Principal */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Topo Fixo */}
        <Header />

        {/* Conteúdo da Página */}
        {/* Adicionei 'relative z-10' para garantir que o conteúdo fique sobre o fundo */}
        <main className="mt-16 p-6 overflow-x-hidden relative z-10">
          {children}
        </main>
        
      </div>
    </div>
  );
}