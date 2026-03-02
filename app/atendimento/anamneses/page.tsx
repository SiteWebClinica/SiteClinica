"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ClipboardList, ArrowLeft } from "lucide-react";

export default function AnamnesesPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // ==========================================
  // ESTADOS DE DADOS (Aqui estavam faltando no seu arquivo!)
  // ==========================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [professionals, setProfessionals] = useState<any[]>([]);
  
  // Estado para armazenar os dados do formulário da Nova Anamnese
  const [formData, setFormData] = useState({
    cliente: "",
    modelo: "",
    profissional: "",
    dataPreenchimento: new Date().toISOString().split('T')[0] // Data de hoje
  });

  // ==========================================
  // INICIALIZAÇÃO E BUSCA DE DADOS
  // ==========================================
  // ==========================================
  // INICIALIZAÇÃO E BUSCA DE DADOS
  // ==========================================
  useEffect(() => {
    // 1. Pega o usuário logado no cache do navegador
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser);
      // Já define o profissional selecionado como o nome do usuário logado
      setFormData(prev => ({ ...prev, profissional: parsedUser.name }));
    }

    // 2. Declara a função AQUI DENTRO, antes de chamar
    async function fetchProfessionals() {
      try {
        const res = await fetch("/api/auxiliary");
        if (res.ok) {
          const data = await res.json();
          setProfessionals(data.professionals || []);
        }
      } catch (e) {
        console.error("Erro ao carregar profissionais", e);
      }
    }

    // 3. Chama a função agora que ela já existe
    fetchProfessionals();
  }, []);

  async function fetchProfessionals() {
    try {
      const res = await fetch("/api/auxiliary");
      if (res.ok) {
        const data = await res.json();
        setProfessionals(data.professionals || []);
      }
    } catch (e) {
      console.error("Erro ao carregar profissionais", e);
    }
  }

  // Estilos padronizados
  const labelStyle = "block text-sm text-gray-700 mb-1";
  const inputStyle = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white text-gray-700";

  return (
    <div className="relative min-h-screen bg-[#f8f9fa]">
      
      {/* ========================================================= */}
      {/* TELA PRINCIPAL (Listagem e Filtros) */}
      {/* ========================================================= */}
      <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isNewModalOpen ? 'hidden' : 'block'}`}>
        
        {/* 1. CABEÇALHO */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 border border-[#00acc1] text-[#00acc1] hover:bg-cyan-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span>Buscar</span>
            <Search size={16} />
            <Filter size={16} />
          </button>

          <h1 className="text-xl text-gray-700 text-center flex-1 font-medium">
            Anamneses Realizadas
          </h1>

          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Nova
          </button>
        </div>

        {/* 2. ÁREA DE FILTROS */}
        {isFilterOpen && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#00acc1] px-6 py-3">
              <h2 className="text-white font-bold">Filtrar Anamneses</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Modelo</label><input type="text" className={inputStyle} /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Cliente</label><input type="text" className={inputStyle} /></div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Profissional</label>
                  <select className={inputStyle}>
                    <option value="">Selecione</option>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {professionals.map((prof: any) => (
                      <option key={prof.id} value={prof.name}>{prof.name}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label><select className={inputStyle}><option value="">Selecione</option></select></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Data</label><select className={inputStyle}><option value="personalizado">Personalizado</option></select></div>
                  <div className="flex gap-4">
                    <div className="flex-1 relative"><label className="block text-xs font-semibold text-gray-600 mb-1">De</label><input type="date" className={inputStyle} /></div>
                    <div className="flex-1 relative"><label className="block text-xs font-semibold text-gray-600 mb-1">Até</label><input type="date" className={inputStyle} /></div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 md:w-1/2 md:pr-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status da Assinatura</label>
                  <select className={inputStyle}><option value="">Selecione</option></select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-50 rounded">Cancelar</button>
                <button className="bg-[#00acc1] hover:bg-[#0097a7] text-white px-8 py-2 rounded-lg font-medium shadow-sm transition-colors">Filtrar</button>
              </div>
            </div>
          </div>
        )}

        {/* TEXTO DE FILTROS APLICADOS */}
        <div className="text-sm">
          <p className="text-gray-600 font-medium">Filtros</p>
          <p className="text-gray-500">Nenhum filtro aplicado.</p>
        </div>

        {/* ESTADO VAZIO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-orange-50 p-6 rounded-full mb-6">
            <ClipboardList size={64} className="text-[#e2a875]" strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 max-w-md text-[15px] leading-relaxed">
            Aqui é onde você pode visualizar as suas anamneses realizadas. 
            Para encontrá-las aqui, basta preenchê-las durante um atendimento.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TELA DE NOVA ANAMNESE (FULL SCREEN) */}
      {/* ========================================================= */}
      {isNewModalOpen && (
        <div className="absolute inset-0 z-50 bg-[#f8f9fa] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Cabeçalho Topo */}
          <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <button 
              onClick={() => setIsNewModalOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={24} />
            </button>
            
            <h2 className="text-xl text-gray-700 font-medium">Nova Anamnese</h2>
            
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-2 rounded font-medium shadow-sm transition-colors">
              Salvar
            </button>
          </div>

          {/* Corpo do Formulário */}
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto bg-white shadow-sm border border-gray-100 rounded-md overflow-hidden">
              
              {/* Faixa Azul: Dados Básicos */}
              <div className="bg-[#00acc1] px-4 py-3 text-white font-bold text-sm">
                Dados Básicos
              </div>

              {/* Campos */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Cliente */}
                <div>
                  <label className={labelStyle}>Cliente<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome do cliente" 
                    className={inputStyle}
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  />
                </div>

                {/* Modelo de Anamnese */}
                <div>
                  <label className={labelStyle}>Modelo de Anamnese<span className="text-red-500">*</span></label>
                  <select 
                    className={inputStyle}
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="geral">Anamnese Geral</option>
                  </select>
                </div>

                {/* Profissional (COM A LÓGICA DO USUÁRIO CORRIGIDA AQUI) */}
                <div>
                  <label className={labelStyle}>Profissional<span className="text-red-500">*</span></label>
                  <select 
                    className={inputStyle}
                    value={formData.profissional}
                    onChange={(e) => setFormData({...formData, profissional: e.target.value})}
                  >
                    {/* Exibe o usuário logado (ex: Joao Paulo) com o texto "(Você)" */}
                    <option value={user?.name || ""}>
                      {user?.name ? `${user.name} (Você)` : "Carregando..."}
                    </option>
                    
                    {/* Renderiza a lista de profissionais puxada da API, ignorando o usuário logado para não repetir */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {professionals.map((prof: any) => {
                      if (prof.name !== user?.name) {
                        return <option key={prof.id} value={prof.name}>{prof.name}</option>
                      }
                      return null;
                    })}
                  </select>
                </div>

                {/* Data de Preenchimento */}
                <div>
                  <label className={labelStyle}>Data de Preenchimento<span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    className={inputStyle}
                    value={formData.dataPreenchimento} 
                    onChange={(e) => setFormData({...formData, dataPreenchimento: e.target.value})}
                  />
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}