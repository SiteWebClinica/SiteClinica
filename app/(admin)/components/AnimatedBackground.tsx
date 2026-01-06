export function AnimatedBackground() {
  return (
    // BASE: Cinza gelo bem clarinho (Visual Limpo de Clínica)
    <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50">
      
      {/* --- BLOB 1: SAÚDE (Ciano/Verde Água) --- 
          Fica no topo esquerdo. Representa a parte médica.
      */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-cyan-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
      
      {/* --- BLOB 2: TECNOLOGIA (Índigo/Azul) --- 
          Fica no topo direito. Representa o software.
      */}
      <div className="absolute top-0 -right-20 w-[600px] h-[600px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000"></div>
      
      {/* --- BLOB 3: CONEXÃO (Azul Suave) --- 
          Fica embaixo movendo-se lentamente para misturar as cores.
      */}
      <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob-slow animation-delay-4000"></div>

      {/* TEXTURA TECH (Grid bem suave)
          Adiciona uma malha quadriculada quase invisível para dar cara de sistema.
      */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      
      {/* Grid Hexagonal ou Pontilhado (Opcional, feito com CSS radial) */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
    </div>
  );
}