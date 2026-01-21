/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { 
  Calendar, Users, ShoppingBag, CreditCard, 
  X, Save, Shield, Stethoscope, User, 
  ChevronLeft, ChevronRight, UserPlus, Edit2, Plus
} from "lucide-react"; 
import { isSameDay, parseISO } from "date-fns";

export default function Dashboard() {
  const router = useRouter(); 
  const [user, setUser] = useState<any>({ name: "Carregando...", userType: "comum" });
  
  // --- CONTROLE DOS MODAIS ---
  const [isModalOpen, setIsModalOpen] = useState(false);       // Modal Agendamento
  const [isAuxModalOpen, setIsAuxModalOpen] = useState(false); // Modal NOVO PACIENTE
  const [loading, setLoading] = useState(false);

  // --- DADOS REAIS ---
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  // --- FORMULÁRIO DE AGENDAMENTO ---
  const [formData, setFormData] = useState({
    title: "", phone: "", procedure: "Consulta Rotina", professional: "Jessica Soares", location: "Sala Avaliação",
    date: new Date().toISOString().split('T')[0], startTime: "08:00", endTime: "09:00", notify: "nao_notificar", repeat: false, notes: "", type: "consultation"
  });

  // --- FORMULÁRIO DE NOVO PACIENTE ---
  const [newPatientData, setNewPatientData] = useState({
    name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
        setUser(JSON.parse(stored));
    } else {
        router.push("/login"); 
    }
    fetchAppointments();
  }, []);

  // --- BUSCAR AGENDAMENTOS ---
  async function fetchAppointments() {
    try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        const today = new Date();
        const todays = data.filter((appt: any) => isSameDay(parseISO(appt.date), today));
        setTodayAppointments(todays);
    } catch (error) { console.error(error); }
  }

  // --- HELPERS FORM PACIENTE ---
  const addField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles') => { 
      setNewPatientData(prev => ({ ...prev, [field]: [...prev[field], ""] })); 
  };
  const updateField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles', index: number, value: string) => {
      const newList = [...newPatientData[field]]; 
      newList[index] = value; 
      setNewPatientData(prev => ({ ...prev, [field]: newList }));
  };

  // --- SALVAR NOVO PACIENTE ---
  async function handleSavePatient() {
      if(!newPatientData.name) return alert("Nome é obrigatório!");
      setLoading(true);

      try {
        const payload = {
            ...newPatientData,
            contacts: [
                ...newPatientData.phones.filter(p => p).map(p => ({ type: 'phone', value: p })),
                ...newPatientData.emails.filter(e => e).map(e => ({ type: 'email', value: e }))
            ],
            addresses: newPatientData.addresses.filter(a => a).map(a => ({ street: a })),
            responsibles: newPatientData.responsibles.filter(r => r).map(r => ({ name: r }))
        };

        const res = await fetch("/api/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(`✅ Paciente ${newPatientData.name} cadastrado!`);
            setIsAuxModalOpen(false);
            setFormData(prev => ({ ...prev, title: newPatientData.name }));
            setNewPatientData({
                name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
                phones: [""], emails: [""], addresses: [""], responsibles: [""]
            });
        } else {
            alert("Erro ao cadastrar paciente.");
        }
      } catch (e) {
          alert("Erro de conexão.");
      } finally {
          setLoading(false);
      }
  }

  // --- SALVAR AGENDAMENTO ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                ...formData, 
                date: new Date(formData.date + "T00:00:00") 
            })
        });

        if (response.ok) {
            alert("✅ Agendamento salvo!");
            setIsModalOpen(false);
            fetchAppointments();
            setFormData({
                title: "", phone: "", procedure: "Consulta Rotina", professional: "Jessica Soares", location: "Sala Avaliação",
                date: new Date().toISOString().split('T')[0], startTime: "08:00", endTime: "09:00", notify: "nao_notificar", repeat: false, notes: "", type: "consultation"
            });
        } else {
            alert("❌ Erro ao salvar agendamento.");
        }
    } catch (error) { alert("Erro de conexão."); } 
    finally { setLoading(false); }
  }

  function getUserBadge() {
    if (user.userType === 'admin') return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><Shield size={12}/> Admin</span>;
    if (user.userType === 'profissional') return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><Stethoscope size={12}/> Profissional</span>;
    return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><User size={12}/> Comum</span>;
  }

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto p-6">
      
      {/* 1. CABEÇALHO (SEM O BOTÃO SAIR) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Olá, {user.name?.split(" ")[0]}! 👋</h1>
            <div className="flex items-center gap-2 mt-1">
                {getUserBadge()}
                <p className="text-gray-500 text-sm hidden sm:block">Painel de Controle</p>
            </div>
        </div>
        {/* Espaço vazio ou outra info se quiser */}
      </div>

      {/* 2. BOTÕES RÁPIDOS */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                <Calendar size={20} /> Novo Agendamento
            </button>
            <Link href="/pacientes/novo" className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                <Users size={20} /> Novo Cliente
            </Link>
            {(user.userType === 'admin' || user.userType === 'profissional') && (
                <Link href="/vendas/nova" className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                    <ShoppingBag size={20} /> Nova Venda
                </Link>
            )}
            {user.userType === 'admin' && (
                <Link href="/financeiro/pagar" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                    <CreditCard size={20} /> Conta a Pagar
                </Link>
            )}
        </div>
      </div>

      {/* 3. ÁREA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FINANCEIRO (Só Admin) */}
        {user.userType === 'admin' ? (
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-sm font-bold text-gray-700">Saúde Financeira</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="relative z-10"><p className="text-green-100 text-sm">A receber hoje</p><h3 className="text-2xl font-bold mt-1">R$ 1.250,00</h3></div>
                        <CreditCard className="absolute -right-4 -bottom-4 text-green-600/30 w-24 h-24 rotate-12" />
                    </div>
                    <div className="bg-red-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="relative z-10"><p className="text-red-100 text-sm">A pagar hoje</p><h3 className="text-2xl font-bold mt-1">R$ 450,00</h3></div>
                        <CreditCard className="absolute -right-4 -bottom-4 text-red-600/30 w-24 h-24 rotate-12" />
                    </div>
                </div>
            </div>
        ) : (
            <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-10">
                <Shield size={48} className="mb-4 opacity-20"/>
                <p>Acesso Restrito ao Financeiro</p>
            </div>
        )}

        {/* AGENDA HOJE */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" /> Agenda de Hoje
            </h3>
            <div className="flex flex-col gap-3">
                {todayAppointments.length === 0 ? (
                    <div className="py-10 text-center text-gray-400"><p className="text-sm">Sem agendamentos hoje.</p></div>
                ) : (
                    todayAppointments.map(appt => (
                        <div key={appt.id} className="p-3 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
                            <p className="font-bold text-gray-800 text-sm">{appt.startTime} - {appt.title}</p>
                            <p className="text-xs text-gray-500">{appt.procedure}</p>
                        </div>
                    ))
                )}
            </div>
            <button onClick={() => window.location.href = '/agenda'} className="w-full mt-4 bg-teal-50 text-teal-700 py-2 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors">Ver Agenda Completa</button>
        </div>
      </div>

      {/* MODAL 1: NOVO AGENDAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-teal-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} /> Novo Agendamento</h2>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                    {/* Linha 1: Cliente e Telefone */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cliente <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input type="text" required placeholder="Nome do cliente..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none" 
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                <button type="button" onClick={() => setIsAuxModalOpen(true)} className="bg-teal-50 text-teal-600 p-2 rounded-lg hover:bg-teal-100 border border-teal-100 transition-colors" title="Novo Cliente Rápido">
                                    <UserPlus size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                             <label className="block text-xs font-bold text-gray-600 mb-1">Telefone</label>
                             <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>

                    {/* Linha 2: Procedimento */}
                    <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Procedimento</label>
                         <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                            value={formData.procedure} onChange={e => setFormData({...formData, procedure: e.target.value})}>
                             <option>Consulta Rotina</option>
                             <option>Avaliação</option>
                             <option>Retorno</option>
                         </select>
                    </div>

                    {/* Linha 3: Datas */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Data</label>
                            <input type="date" required className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" 
                                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Início</label>
                             <input type="time" required className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" 
                                value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Fim</label>
                             <input type="time" required className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" 
                                value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm shadow-teal-200 transition-all">
                            {loading ? "Salvando..." : <><Save size={18} /> Salvar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL 2: NOVO PACIENTE */}
      {isAuxModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h4 className="font-bold text-gray-800 text-lg">Novo Cadastro</h4>
                    <button onClick={() => setIsAuxModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label><input type="text" className="w-full border rounded p-2 outline-none" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase">CPF</label><input type="text" className="w-full border rounded p-2 outline-none" value={newPatientData.cpf} onChange={e => setNewPatientData({...newPatientData, cpf: e.target.value})} /></div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Contatos</div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div><label className="text-xs font-bold text-gray-700 mb-2 block">Telefones</label><div className="space-y-2 mb-2">{newPatientData.phones.map((phone, idx) => (<input key={idx} type="text" className="w-full border rounded p-2 text-sm" value={phone} onChange={e => updateField('phones', idx, e.target.value)} />))}</div><button onClick={() => addField('phones')} className="text-pink-600 text-xs font-bold">Adicionar +</button></div>
                                <div><label className="text-xs font-bold text-gray-700 mb-2 block">Emails</label><div className="space-y-2 mb-2">{newPatientData.emails.map((email, idx) => (<input key={idx} type="email" className="w-full border rounded p-2 text-sm" value={email} onChange={e => updateField('emails', idx, e.target.value)} />))}</div><button onClick={() => addField('emails')} className="text-pink-600 text-xs font-bold">Adicionar +</button></div>
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Emergência</div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label><input type="text" className="w-full border rounded p-1.5" value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})}/></div>
                                <div><label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label><input type="text" className="w-full border rounded p-1.5" value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})}/></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
                    <button onClick={() => setIsAuxModalOpen(false)} className="text-sm font-medium text-gray-500 px-4 py-2">Cancelar</button>
                    <button onClick={handleSavePatient} disabled={loading} className="bg-pink-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-pink-700">{loading ? 'Salvando...' : 'Salvar Cadastro'}</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}