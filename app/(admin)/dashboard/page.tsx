/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { 
  Calendar, Users, ShoppingBag, CreditCard, 
  X, Shield, Stethoscope, User, 
  UserPlus, Search, ChevronDown, Plus, Trash2 
} from "lucide-react"; 
import { isSameDay, parseISO, differenceInYears } from "date-fns";

export default function Dashboard() {
  const router = useRouter(); 
  const [user, setUser] = useState<any>({ name: "Carregando...", userType: "comum" });
  
  // --- ESTADOS DE DADOS AUXILIARES (Vindo do Banco) ---
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // --- CONTROLE DOS MODAIS ---
  const [isModalOpen, setIsModalOpen] = useState(false);       
  const [isAuxModalOpen, setIsAuxModalOpen] = useState(false); 
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- DADOS ---
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- FORMULÁRIO DE AGENDAMENTO ---
  const [formData, setFormData] = useState({
    title: "", 
    phone: "", 
    procedure: "", 
    professional: "", 
    location: "", 
    date: new Date().toISOString().split('T')[0], 
    startTime: "08:00", 
    endTime: "09:00", 
    notify: "nao_notificar", 
    repeat: false, 
    notes: "", 
    color: "blue", 
    type: "consultation"
  });

  // --- FORMULÁRIO NOVO PACIENTE ---
  const [newPatientData, setNewPatientData] = useState({
    name: "", birthDate: "", age: "", rg: "", cpf: "", instagram: "", 
    profession: "", workplace: "", gender: "", civilStatus: "", referral: "", notes: "",
    healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  // --- FORMULÁRIO NOVO PROFISSIONAL ---
  const [newProfData, setNewProfData] = useState({
    name: "", specialty: "", register: "", phone: "", email: "", color: "blue"
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored)); else router.push("/login"); 
    
    fetchAppointments();
    fetchAuxiliaryData();
  }, []);

  async function fetchAuxiliaryData() {
      try {
          const res = await fetch("/api/auxiliary");
          if (res.ok) {
            const data = await res.json();
            setProfessionals(data.professionals || []);
            setServices(data.services || []);
            setLocations(data.locations || []);
            
            if (!formData.professional && data.professionals.length > 0) {
                setFormData(prev => ({ ...prev, professional: data.professionals[0].name }));
            }
            if (!formData.procedure && data.services.length > 0) {
                setFormData(prev => ({ ...prev, procedure: data.services[0].name }));
            }
            if (!formData.location && data.locations.length > 0) {
                setFormData(prev => ({ ...prev, location: data.locations[0].name }));
            }
          }
      } catch (e) { console.error("Erro ao carregar listas", e); }
  }

  async function fetchAppointments() {
    try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
            const data = await res.json();
            const today = new Date();
            const todays = data.filter((appt: any) => isSameDay(parseISO(appt.date), today));
            setTodayAppointments(todays);
        }
    } catch (error) { console.error(error); }
  }

  // --- BUSCA INTELIGENTE ---
  const handleClientSearch = (text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
        try {
            const res = await fetch(`/api/patients/search?q=${text}`);
            const data = await res.json();
            if (Array.isArray(data)) { setSuggestions(data); setShowSuggestions(true); } else { setShowSuggestions(false); }
        } catch (e) { console.error(e); }
    }, 300);
  };
  const selectSuggestion = (client: any) => { setFormData(prev => ({ ...prev, title: client.name, phone: client.phone || prev.phone })); setSuggestions([]); setShowSuggestions(false); };
  
  // --- FUNÇÕES MODAL CLIENTE ---
  type ListField = 'phones' | 'emails' | 'addresses' | 'responsibles';
  const addField = (field: ListField) => { setNewPatientData(prev => ({ ...prev, [field]: [...prev[field], ""] })); };
  const updateField = (field: ListField, index: number, value: string) => { setNewPatientData(prev => { const newList = [...prev[field]]; newList[index] = value; return { ...prev, [field]: newList }; }); };
  const removeField = (field: ListField, index: number) => { setNewPatientData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) })); };
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => { const date = e.target.value; let age = ""; if (date) { age = differenceInYears(new Date(), new Date(date)).toString(); } setNewPatientData(prev => ({ ...prev, birthDate: date, age })); };
  
  async function handleSavePatient() {
      if(!newPatientData.name) return alert("Nome é obrigatório!");
      setLoading(true);
      try {
        const payload = { ...newPatientData, birthDate: newPatientData.birthDate ? new Date(newPatientData.birthDate) : null, contacts: [ ...newPatientData.phones.filter(p => p).map(p => ({ type: 'phone', value: p })), ...newPatientData.emails.filter(e => e).map(e => ({ type: 'email', value: e })) ], addresses: newPatientData.addresses.filter(a => a).map(a => ({ street: a })), responsibles: newPatientData.responsibles.filter(r => r).map(r => ({ name: r })) };
        const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { alert(`✅ Cliente ${newPatientData.name} salvo!`); setIsAuxModalOpen(false); setFormData(prev => ({ ...prev, title: newPatientData.name })); } else { alert("Erro ao salvar."); }
      } catch (e) { alert("Erro conexão."); } finally { setLoading(false); }
  }

  async function handleSaveProfessional() {
      if (!newProfData.name) return alert("Nome é obrigatório!");
      setLoading(true);
      try {
          const res = await fetch("/api/professionals", { 
              method: "POST", 
              headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify(newProfData) 
          });
          
          if (res.ok) {
              alert("Profissional cadastrado!");
              setIsProfModalOpen(false);
              fetchAuxiliaryData(); 
              setNewProfData({ name: "", specialty: "", register: "", phone: "", email: "", color: "blue" });
          } else { alert("Erro ao salvar."); }
      } catch (e) { alert("Erro conexão."); } 
      finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
        const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, date: new Date(formData.date + "T00:00:00") }) });
        if (response.ok) { alert("✅ Agendamento salvo!"); setIsModalOpen(false); fetchAppointments(); } else { alert("❌ Erro ao salvar."); }
    } catch (error) { alert("Erro conexão."); } finally { setLoading(false); }
  }

  function handleCreateProfessional() {
      setIsProfModalOpen(true);
  }

  function getUserBadge() {
    if (user.userType === 'admin') return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><Shield size={12}/> Admin</span>;
    if (user.userType === 'profissional') return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><Stethoscope size={12}/> Profissional</span>;
    return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold"><User size={12}/> Comum</span>;
  }

  const labelStyle = "block text-xs font-bold text-gray-600 mb-1";
  const inputStyle = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#00acc1] focus:border-[#00acc1] outline-none bg-white text-gray-700 placeholder-gray-400";
  const inputGroupLeft = "w-full border border-gray-300 rounded-l px-3 py-2 text-sm focus:ring-1 focus:ring-[#00acc1] focus:border-[#00acc1] outline-none bg-white text-gray-700 placeholder-gray-400";
  const buttonGroupRight = "bg-teal-50 text-teal-600 px-3 py-2 rounded-r border border-l-0 border-gray-300 hover:bg-teal-100 transition-colors flex items-center justify-center";
  const headerStyle = "bg-[#00acc1] px-4 py-2 text-white font-bold text-sm rounded-t-lg";

  return (
    <div className="space-y-6 relative max-w-7xl mx-auto p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Olá, {user.name?.split(" ")[0]}! 👋</h1><div className="flex items-center gap-2 mt-1">{getUserBadge()}<p className="text-gray-500 text-sm hidden sm:block">Painel de Controle</p></div></div>
      </div>

      {/* BOTÕES */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"><Calendar size={20} /> Novo Agendamento</button>
            <button onClick={() => setIsAuxModalOpen(true)} className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"><Users size={20} /> Novo Cliente</button>
            {(user.userType === 'admin' || user.userType === 'profissional') && <Link href="/vendas/nova" className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"><ShoppingBag size={20} /> Nova Venda</Link>}
            {user.userType === 'admin' && <Link href="/financeiro/pagar" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm transition-all hover:scale-105 active:scale-95"><CreditCard size={20} /> Conta a Pagar</Link>}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user.userType === 'admin' ? (
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-sm font-bold text-gray-700">Saúde Financeira</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden transition-all hover:shadow-lg"><div className="relative z-10"><p className="text-green-100 text-sm">A receber hoje</p><h3 className="text-2xl font-bold mt-1">R$ 1.250,00</h3></div><CreditCard className="absolute -right-4 -bottom-4 text-green-600/30 w-24 h-24 rotate-12" /></div>
                    <div className="bg-red-500 text-white p-5 rounded-xl shadow-sm relative overflow-hidden transition-all hover:shadow-lg"><div className="relative z-10"><p className="text-red-100 text-sm">A pagar hoje</p><h3 className="text-2xl font-bold mt-1">R$ 450,00</h3></div><CreditCard className="absolute -right-4 -bottom-4 text-red-600/30 w-24 h-24 rotate-12" /></div>
                </div>
            </div>
        ) : ( <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-10"><Shield size={48} className="mb-4 opacity-20"/><p>Acesso Restrito ao Financeiro</p></div> )}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={18} className="text-teal-600" /> Agenda de Hoje</h3>
            <div className="flex flex-col gap-3">{todayAppointments.length === 0 ? <div className="py-10 text-center text-gray-400"><p className="text-sm">Sem agendamentos hoje.</p></div> : todayAppointments.map(appt => (<div key={appt.id} className="p-3 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg"><p className="font-bold text-gray-800 text-sm">{appt.startTime} - {appt.title}</p><p className="text-xs text-gray-500">{appt.procedure}</p></div>))}</div>
            <button onClick={() => window.location.href = '/agenda'} className="w-full mt-4 bg-teal-50 text-teal-700 py-2 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors">Ver Agenda Completa</button>
        </div>
      </div>

      {/* --- MODAL 1: NOVO AGENDAMENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-[#00acc1] px-6 py-3 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-lg font-bold">Novo Agendamento</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/10 px-2 py-1 rounded"><span>Cor</span><div className={`w-3 h-3 rounded-full border-2 border-white ${formData.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`}></div><ChevronDown size={14} /></div>
                        <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar bg-white">
                    <div className="grid grid-cols-12 gap-6">
                        
                        {/* CLIENTE + BOTÃO USER PLUS */}
                        <div className="col-span-12 md:col-span-5 relative">
                            <label className={labelStyle}>Cliente<span className="text-red-500">*</span></label>
                            <div className="flex relative">
                                <input type="text" required placeholder="Digite o nome do cliente" className={`${inputGroupLeft} pr-8`} value={formData.title} onChange={e => handleClientSearch(e.target.value)} autoComplete="off" />
                                <Search className="absolute right-14 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                                <button type="button" onClick={() => setIsAuxModalOpen(true)} className={buttonGroupRight} title="Novo Cliente"><UserPlus size={18} /></button>
                                {showSuggestions && <div className="absolute z-10 w-full top-full left-0 bg-white border border-gray-200 rounded-b-lg shadow-xl mt-1 max-h-40 overflow-y-auto">{suggestions.map((client, idx) => (<div key={idx} onClick={() => selectSuggestion(client)} className="p-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"><p className="font-bold">{client.name}</p></div>))}</div>}
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-3"><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                        
                        {/* PROFISSIONAL + BOTÃO PLUS */}
                        <div className="col-span-12 md:col-span-4">
                            <label className={labelStyle}>Profissional<span className="text-red-500">*</span></label>
                            <div className="flex">
                                <select className={inputGroupLeft} value={formData.professional} onChange={e => setFormData({...formData, professional: e.target.value})}>
                                    {professionals.map(prof => <option key={prof.id} value={prof.name}>{prof.name}</option>)}
                                </select>
                                <button type="button" onClick={handleCreateProfessional} className={buttonGroupRight} title="Novo Profissional"><Plus size={18} /></button>
                            </div>
                        </div>

                        {/* OUTROS CAMPOS */}
                        <div className="col-span-12 md:col-span-8"><label className={labelStyle}>Procedimentos</label><select className={inputStyle} value={formData.procedure} onChange={e => setFormData({...formData, procedure: e.target.value})}>{services.map(srv => <option key={srv.id} value={srv.name}>{srv.name}</option>)}</select></div>
                        <div className="col-span-12 md:col-span-4"><label className={labelStyle}>Local do Procedimento<span className="text-red-500">*</span></label><select className={inputStyle} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>{locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}</select></div>
                        <div className="col-span-12 md:col-span-3"><label className={labelStyle}>Data<span className="text-red-500">*</span></label><input type="date" required className={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                        <div className="col-span-6 md:col-span-2"><label className={labelStyle}>Hora Início<span className="text-red-500">*</span></label><input type="time" required className={inputStyle} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} /></div>
                        <div className="col-span-6 md:col-span-2"><label className={labelStyle}>Hora Fim<span className="text-red-500">*</span></label><input type="time" required className={inputStyle} value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} /></div>
                        <div className="col-span-12 md:col-span-5"><label className={labelStyle}>Notificar Cliente?<span className="text-red-500">*</span></label><select className={inputStyle} value={formData.notify} onChange={e => setFormData({...formData, notify: e.target.value})}><option value="nao_notificar">Não notificar</option><option value="email">Email</option><option value="sms">SMS</option></select></div>
                        <div className="col-span-12"><label className={labelStyle}>Repetir?</label><div onClick={() => setFormData(prev => ({ ...prev, repeat: !prev.repeat }))} className={`w-10 h-5 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${formData.repeat ? 'bg-[#00acc1]' : 'bg-gray-300'}`}><div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${formData.repeat ? 'translate-x-5' : ''}`}></div></div></div>
                        <div className="col-span-12"><label className={labelStyle}>Motivo da Consulta</label><textarea rows={3} className={inputStyle} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
                    </div>
                    <div className="mt-6 flex justify-end pt-4 border-t border-gray-100"><button type="submit" disabled={loading} className="bg-[#00acc1] hover:bg-[#0097a7] text-white px-8 py-2 rounded shadow-sm font-medium transition-colors">{loading ? "Salvando..." : "Salvar"}</button></div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL 2: NOVO PACIENTE (Completo e Corrigido com Trash2) --- */}
      {isAuxModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg"><button onClick={() => setIsAuxModalOpen(false)}><X size={24} className="text-gray-400 hover:text-red-500"/></button><h4 className="text-gray-600 text-lg font-medium">Novo Cliente</h4><button onClick={handleSavePatient} disabled={loading} className="bg-[#e91e63] hover:bg-pink-700 text-white px-6 py-1.5 rounded shadow text-sm font-medium">Salvar</button></div>
                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar space-y-6 bg-[#f5f5f5]">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Dados Básicos</div><div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4"><div className="md:col-span-2"><label className={labelStyle}>Nome <span className="text-red-500">*</span></label><input type="text" className={inputStyle} value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} /></div><div><label className={labelStyle}>Data de Nascimento</label><input type="date" className={inputStyle} value={newPatientData.birthDate} onChange={handleBirthDateChange} /></div><div><label className={labelStyle}>Idade</label><input type="text" disabled className={`${inputStyle} bg-gray-100`} value={newPatientData.age} /></div><div><label className={labelStyle}>RG</label><input type="text" className={inputStyle} value={newPatientData.rg} onChange={e => setNewPatientData({...newPatientData, rg: e.target.value})} /></div><div><label className={labelStyle}>CPF/CNPJ</label><input type="text" className={inputStyle} value={newPatientData.cpf} onChange={e => setNewPatientData({...newPatientData, cpf: e.target.value})} /></div><div className="md:col-span-2"><label className={labelStyle}>Instagram</label><input type="text" className={inputStyle} value={newPatientData.instagram} onChange={e => setNewPatientData({...newPatientData, instagram: e.target.value})} /></div><div className="md:col-span-2"><label className={labelStyle}>Profissão</label><input type="text" className={inputStyle} value={newPatientData.profession} onChange={e => setNewPatientData({...newPatientData, profession: e.target.value})} /></div><div className="md:col-span-2"><label className={labelStyle}>Local de Trabalho</label><input type="text" className={inputStyle} value={newPatientData.workplace} onChange={e => setNewPatientData({...newPatientData, workplace: e.target.value})} /></div><div><label className={labelStyle}>Gênero</label><select className={inputStyle} value={newPatientData.gender} onChange={e => setNewPatientData({...newPatientData, gender: e.target.value})}><option value="">Selecione</option><option value="Feminino">Feminino</option><option value="Masculino">Masculino</option></select></div><div><label className={labelStyle}>Estado Civil</label><select className={inputStyle} value={newPatientData.civilStatus} onChange={e => setNewPatientData({...newPatientData, civilStatus: e.target.value})}><option value="">Selecione</option><option value="Solteiro">Solteiro</option><option value="Casado">Casado</option></select></div><div className="md:col-span-2"><label className={labelStyle}>Indicação</label><select className={inputStyle} value={newPatientData.referral} onChange={e => setNewPatientData({...newPatientData, referral: e.target.value})}><option value="">Selecione</option><option value="Instagram">Instagram</option><option value="Google">Google</option></select></div><div className="md:col-span-4"><label className={labelStyle}>Observações</label><textarea rows={2} className={inputStyle} value={newPatientData.notes} onChange={e => setNewPatientData({...newPatientData, notes: e.target.value})}></textarea></div></div></div>
                    {/* Contatos com Trash2 corrigido */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Contatos</div><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8"><div><label className="text-sm font-bold text-gray-800 mb-2 block">Telefones</label>{newPatientData.phones.map((phone, idx) => (<div key={idx} className="flex gap-2 mb-2"><input type="text" className={inputStyle} placeholder="(00) 00000-0000" value={phone} onChange={e => updateField('phones', idx, e.target.value)} /><button type="button" onClick={() => removeField('phones', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('phones')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Telefone</button></div><div><label className="text-sm font-bold text-gray-800 mb-2 block">Emails</label>{newPatientData.emails.map((email, idx) => (<div key={idx} className="flex gap-2 mb-2"><input type="email" className={inputStyle} placeholder="email@exemplo.com" value={email} onChange={e => updateField('emails', idx, e.target.value)} /><button type="button" onClick={() => removeField('emails', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('emails')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Email</button></div></div></div>
                    {/* Endereços e Emergência */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Endereços</div><div className="p-6">{newPatientData.addresses.map((addr, idx) => (<div key={idx} className="flex gap-2 mb-2"><input className={inputStyle} value={addr} onChange={e => updateField('addresses', idx, e.target.value)}/><button type="button" onClick={() => removeField('addresses', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('addresses')} className="border border-pink-400 text-pink-500 px-4 py-1.5 rounded text-sm hover:bg-pink-50">Adicionar Endereço</button></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Contato de Emergência</div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className={labelStyle}>Nome</label><input type="text" className={inputStyle} value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})} /></div><div className="col-span-2"><label className={labelStyle}>Plano de Saúde</label><input type="text" className={inputStyle} value={newPatientData.healthPlan} onChange={e => setNewPatientData({...newPatientData, healthPlan: e.target.value})} /></div><div><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})} /></div><div><label className={labelStyle}>Tipo Sanguíneo</label><select className={inputStyle} value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})}><option value="">Selecione</option><option value="A+">A+</option><option value="O+">O+</option><option value="AB+">AB+</option></select></div></div></div><div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Responsáveis</div><div className="p-6">{newPatientData.responsibles.map((resp, idx) => (<div key={idx} className="flex gap-2 mb-2"><input className={inputStyle} placeholder="Nome" value={resp} onChange={e => updateField('responsibles', idx, e.target.value)} /><button type="button" onClick={() => removeField('responsibles', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('responsibles')} className="border border-pink-400 text-pink-500 px-4 py-1.5 rounded text-sm hover:bg-pink-50">Adicionar Responsável</button></div></div></div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 3: NOVO PROFISSIONAL --- */}
      {isProfModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-[#00acc1] px-6 py-3 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold">Novo Profissional</h2>
                    <button onClick={() => setIsProfModalOpen(false)}><X size={20} /></button>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className={labelStyle}>Nome Completo <span className="text-red-500">*</span></label><input type="text" className={inputStyle} value={newProfData.name} onChange={e => setNewProfData({...newProfData, name: e.target.value})} /></div>
                    <div><label className={labelStyle}>Especialidade</label><input type="text" className={inputStyle} placeholder="Ex: Cardiologista" value={newProfData.specialty} onChange={e => setNewProfData({...newProfData, specialty: e.target.value})} /></div>
                    <div><label className={labelStyle}>Registro (CRM/CRO)</label><input type="text" className={inputStyle} value={newProfData.register} onChange={e => setNewProfData({...newProfData, register: e.target.value})} /></div>
                    <div><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={newProfData.phone} onChange={e => setNewProfData({...newProfData, phone: e.target.value})} /></div>
                    <div><label className={labelStyle}>Cor na Agenda</label><select className={inputStyle} value={newProfData.color} onChange={e => setNewProfData({...newProfData, color: e.target.value})}><option value="blue">Azul</option><option value="green">Verde</option><option value="red">Vermelho</option><option value="purple">Roxo</option><option value="orange">Laranja</option></select></div>
                    <div className="col-span-2 pt-4 flex justify-end"><button onClick={handleSaveProfessional} disabled={loading} className="bg-[#00acc1] hover:bg-[#0097a7] text-white px-6 py-2 rounded font-bold shadow-sm">{loading ? "Salvando..." : "Salvar Profissional"}</button></div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}