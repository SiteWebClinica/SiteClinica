"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, Users, ShoppingBag, CreditCard, 
  X, Save, UserPlus, Edit2, Plus, Clock, CheckCircle,
  ChevronLeft, ChevronRight
} from "lucide-react"; 

export default function Dashboard() {
  const [user, setUser] = useState<any>({ name: "Usuario" });
  
  // --- CONTROLE DOS MODAIS ---
  const [isModalOpen, setIsModalOpen] = useState(false);       // Modal Novo Agendamento
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Modal Calendário Visual
  const [isAuxModalOpen, setIsAuxModalOpen] = useState(false); // Modal NOVO PACIENTE (Vindo da Agenda)

  const [loading, setLoading] = useState(false);

  // --- ESTADO DO NOVO PACIENTE (Igual da Agenda) ---
  const [newPatientData, setNewPatientData] = useState({
    name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // --- LÓGICA DO NOVO PACIENTE (Igual da Agenda) ---
  const addField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles') => { 
      setNewPatientData(prev => ({ ...prev, [field]: [...prev[field], ""] })); 
  };
  
  const updateField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles', index: number, value: string) => {
      const newList = [...newPatientData[field]]; 
      newList[index] = value; 
      setNewPatientData(prev => ({ ...prev, [field]: newList }));
  };

  function handleSavePatient() {
      // Simula salvamento do paciente
      if(!newPatientData.name) return alert("Nome é obrigatório!");
      
      alert(`Paciente ${newPatientData.name} cadastrado com sucesso!`);
      
      // Aqui você selecionaria o paciente no formulário automaticamente
      setIsAuxModalOpen(false);
      
      // Limpa os dados
      setNewPatientData({
        name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
        phones: [""], emails: [""], addresses: [""], responsibles: [""]
      });
  }

  // --- LÓGICA DO AGENDAMENTO ---
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        alert("Agendamento salvo com sucesso!");
    }, 1500);
  }

  function openNewAppointment() {
      setIsCalendarOpen(false); 
      setIsModalOpen(true);     
  }

  return (
    <div className="space-y-6 relative">
      
      {/* 1. Título e Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Olá, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aqui está o resumo da sua clínica hoje.
        </p>
      </div>

      {/* 2. Botões de Ação Rápida */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm"
            >
                <Calendar size={20} /> Novo Agendamento
            </button>

            <Link href="/pacientes/novo" className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm">
                <Users size={20} /> Novo Cliente
            </Link>
            <Link href="/vendas/nova" className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm">
                <ShoppingBag size={20} /> Nova Venda
            </Link>
            <Link href="/financeiro/pagar" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm">
                <CreditCard size={20} /> Conta a Pagar
            </Link>
        </div>
      </div>

      {/* 3. Área Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Financeiro */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold text-gray-700">Saúde Financeira</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-green-100 text-sm">A receber hoje</p>
                        <h3 className="text-2xl font-bold mt-1">R$ 0,00</h3>
                    </div>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-bold backdrop-blur-sm transition-colors">Abrir</button>
                    <CreditCard className="absolute -right-4 -bottom-4 text-green-600/30 w-24 h-24 rotate-12" />
                </div>

                <div className="bg-red-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-red-100 text-sm">A pagar hoje</p>
                        <h3 className="text-2xl font-bold mt-1">R$ 0,00</h3>
                    </div>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-bold backdrop-blur-sm transition-colors">Abrir</button>
                    <CreditCard className="absolute -right-4 -bottom-4 text-red-600/30 w-24 h-24 rotate-12" />
                </div>

                <div className="bg-white border border-green-200 text-green-600 p-5 rounded-xl shadow-sm relative">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-400">Recebimentos Vencidos</p>
                    <h3 className="text-2xl font-bold mt-1">R$ 0,00</h3>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 border border-green-200 hover:bg-green-50 px-3 py-1 rounded text-xs font-bold transition-colors">Abrir</button>
                </div>

                <div className="bg-white border border-red-200 text-red-600 p-5 rounded-xl shadow-sm relative">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-400">Pagamentos Vencidos</p>
                    <h3 className="text-2xl font-bold mt-1">R$ 0,00</h3>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 border border-red-200 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold transition-colors">Abrir</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">Resumo do Mês</h3>
                    <Calendar size={16} className="text-teal-500" />
                </div>
                
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-100 text-left">
                            <th className="pb-3 font-medium text-xs uppercase">Status</th>
                            <th className="pb-3 font-medium text-xs uppercase text-right">A Receber</th>
                            <th className="pb-3 font-medium text-xs uppercase text-right">A Pagar</th>
                            <th className="pb-3 font-medium text-xs uppercase text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-50 last:border-0">
                            <td className="py-3">Previsto</td>
                            <td className="py-3 text-right text-green-600">7.000,00</td>
                            <td className="py-3 text-right text-red-500">1.784,90</td>
                            <td className="py-3 text-right font-bold text-blue-600">5.215,10</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Lado Direito: Agenda */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" /> Agenda de Hoje
            </h3>
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <Calendar size={24} />
                </div>
                <p className="text-sm">Nenhum agendamento para hoje.</p>
            </div>
            {/* Botão Ver Agenda */}
            <button 
                onClick={() => setIsCalendarOpen(true)}
                className="w-full mt-4 bg-teal-50 text-teal-700 py-2 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors"
            >
                Ver Agenda Completa
            </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: NOVO AGENDAMENTO */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                <div className="bg-teal-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Calendar size={20} /> Novo Agendamento
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                    {/* Linha 1: Cliente e Telefone */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cliente <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Busque ou digite..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                                
                                {/* AQUI ESTÁ O BOTÃO QUE ABRE O CADASTRO DE PACIENTE */}
                                <button 
                                    type="button" 
                                    onClick={() => setIsAuxModalOpen(true)}
                                    className="bg-teal-50 text-teal-600 p-2 rounded-lg hover:bg-teal-100 border border-teal-100"
                                    title="Novo Cliente"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                             <label className="block text-xs font-bold text-gray-600 mb-1">Telefone</label>
                             <input type="text" disabled placeholder="Automático..." className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                    </div>

                    {/* Linha 2 */}
                    <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Procedimentos</label>
                         <div className="flex gap-2">
                             <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                                 <option>Consulta Rotina</option>
                                 <option>Avaliação</option>
                                 <option>Retorno</option>
                             </select>
                             <button type="button" className="bg-teal-50 text-teal-600 p-2 rounded-lg hover:bg-teal-100 border border-teal-100"><Edit2 size={18} /></button>
                         </div>
                    </div>

                    {/* Linha 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Profissional <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                                    <option>Jessica Soares</option>
                                    <option>Dr. João Silva</option>
                                </select>
                                <button type="button" className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 border border-gray-200"><Plus size={18} /></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Local <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                                    <option>Sala Avaliação</option>
                                    <option>Consultório 1</option>
                                </select>
                                <button type="button" className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 border border-gray-200"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Linha 4 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Data <span className="text-red-500">*</span></label>
                            <input type="date" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Início <span className="text-red-500">*</span></label>
                             <input type="time" defaultValue="08:00" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Fim <span className="text-red-500">*</span></label>
                             <input type="time" defaultValue="09:00" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Notificar? <span className="text-red-500">*</span></label>
                            <select className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white">
                                <option>Não notificar</option>
                                <option>Email</option>
                                <option>Whatsapp</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-700">Repetir?</label>
                        <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 peer checked:translate-x-full" />
                            <div className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-teal-500"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Motivo da Consulta</label>
                        <textarea rows={3} placeholder="Descreva o motivo..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none resize-none"></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm shadow-teal-200 transition-all">{loading ? "Salvando..." : <><Save size={18} /> Salvar</>}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: AGENDA VISUAL */}
      {/* ============================================================ */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Janeiro 2026</h2>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-gray-100 rounded-full transition-all text-gray-600"><ChevronLeft size={20} /></button>
                            <button className="p-1 hover:bg-gray-100 rounded-full transition-all text-gray-600"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <button onClick={() => setIsCalendarOpen(false)} className="bg-gray-50 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors"><X size={20} /></button>
                </div>
                {/* Calendário Body */}
                <div className="p-6 bg-white">
                    <div className="grid grid-cols-7 text-center mb-2">{["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(day => <div key={day} className="text-xs font-bold text-gray-400 py-2">{day}</div>)}</div>
                    <div className="grid grid-cols-7 border-t border-l border-gray-100">
                        {[28, 29, 30, 31].map(day => <div key={`prev-${day}`} className="h-24 border-r border-b border-gray-100 p-2 text-gray-300 text-sm font-medium">{day}</div>)}
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (<div key={day} className={`h-24 border-r border-b border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${day === 8 ? 'bg-teal-50/30' : ''}`}><span className={`text-sm font-medium inline-flex w-7 h-7 items-center justify-center rounded-full ${day === 8 ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-700'}`}>{day}</span></div>))}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end"><button onClick={openNewAppointment} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"><Plus size={20} /> Incluir Novo Agendamento</button></div>
            </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: NOVO PACIENTE (VINDO DA AGENDA) */}
      {/* ============================================================ */}
      {isAuxModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h4 className="font-bold text-gray-800 text-lg">Novo Cadastro</h4>
                    <button onClick={() => setIsAuxModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label><input type="text" className="w-full border rounded p-2 focus:ring-2 ring-cyan-100 outline-none" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">CPF</label><input type="text" className="w-full border rounded p-2 focus:ring-2 ring-cyan-100 outline-none" value={newPatientData.cpf} onChange={e => setNewPatientData({...newPatientData, cpf: e.target.value})} /></div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Contatos</div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div><label className="text-xs font-bold text-gray-700 mb-2 block">Telefones</label><div className="space-y-2 mb-2">{newPatientData.phones.map((phone, idx) => (<input key={idx} type="text" placeholder="(00) 00000-0000" className="w-full border rounded p-2 text-sm" value={phone} onChange={e => updateField('phones', idx, e.target.value)} />))}</div><button onClick={() => addField('phones')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Telefone</button></div>
                                <div><label className="text-xs font-bold text-gray-700 mb-2 block">Emails</label><div className="space-y-2 mb-2">{newPatientData.emails.map((email, idx) => (<input key={idx} type="email" placeholder="exemplo@email.com" className="w-full border rounded p-2 text-sm" value={email} onChange={e => updateField('emails', idx, e.target.value)} />))}</div><button onClick={() => addField('emails')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Email</button></div>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Endereços</div>
                            <div className="p-4"><div className="space-y-2 mb-2">{newPatientData.addresses.map((addr, idx) => (<input key={idx} type="text" placeholder="Rua, Número, Bairro, Cidade..." className="w-full border rounded p-2 text-sm" value={addr} onChange={e => updateField('addresses', idx, e.target.value)} />))}</div><button onClick={() => addField('addresses')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Endereço</button></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-lg overflow-hidden h-full">
                                <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Contato de Emergência</div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})}/></div>
                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})}/></div>
                                    <div><label className="text-[10px] font-bold text-gray-500 uppercase">Tipo Sanguíneo</label><select className="w-full border rounded p-1.5 text-sm bg-white" value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})}><option value="">Selecione</option><option value="A+">A+</option><option value="O+">O+</option></select></div>
                                    <div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Plano de Saúde</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.healthPlan} onChange={e => setNewPatientData({...newPatientData, healthPlan: e.target.value})}/></div>
                                </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden h-full">
                                <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Responsáveis</div>
                                <div className="p-4"><div className="space-y-2 mb-2">{newPatientData.responsibles.map((resp, idx) => (<input key={idx} type="text" placeholder="Nome do Responsável" className="w-full border rounded p-2 text-sm" value={resp} onChange={e => updateField('responsibles', idx, e.target.value)} />))}</div><button onClick={() => addField('responsibles')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Responsável</button></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
                    <button onClick={() => setIsAuxModalOpen(false)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2">Cancelar</button>
                    <button onClick={handleSavePatient} className="bg-pink-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-pink-700 shadow-md shadow-pink-200">Salvar Cadastro</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}