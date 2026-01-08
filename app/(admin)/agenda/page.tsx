"use client";

import { useEffect, useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Save,
  Calendar as CalendarIcon,
  Pencil,
  UserPlus,
  Check,
  User
} from "lucide-react";
import clsx from "clsx";

// --- TIPAGEM ---
type Appointment = {
  id: number;
  date: Date;
  title: string;
  phone: string | null;
  procedure: string | null;
  professional: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  notes: string | null;
  notify: string | null;
  repeat: boolean;
  type: string;
};

type Patient = {
  id: number;
  name: string;
  cpf: string;
  contacts: any[];
};

export default function AgendaPage() {
  // --- ESTADOS ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estado dos Dados (Do Banco)
  const [events, setEvents] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Estado da Busca de Pacientes
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Controle dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de Agendamento
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // --- MODAL AUXILIAR (Novo Item/Paciente) ---
  const [isAuxModalOpen, setIsAuxModalOpen] = useState(false);
  const [auxType, setAuxType] = useState<"patient" | "procedure" | "professional" | "location" | null>(null);
  const [newItemName, setNewItemName] = useState("");

  // Listas Dinâmicas
  const [proceduresList, setProceduresList] = useState(["Consulta Rotina", "Exame Geral", "Retorno"]);
  const [professionalsList, setProfessionalsList] = useState(["Jessica Soares", "Dr. João"]);
  const [locationsList, setLocationsList] = useState(["Sala Avaliação", "Sala 1"]);

  // Estado do Novo Paciente (Complexo)
  const [newPatientData, setNewPatientData] = useState({
    name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  // Formulário de Agendamento
  const [formData, setFormData] = useState({
    title: "", phone: "", procedure: "", professional: "", location: "",
    date: "", startTime: "08:00", endTime: "09:00", notify: "nao_notificar", repeat: false, notes: "", type: "consultation"
  });

  // --- CARREGAR DADOS ---
  useEffect(() => {
    // 1. Carregar Agendamentos
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        const formattedEvents = data.map((evt: any) => ({ ...evt, date: new Date(evt.date) }));
        setEvents(formattedEvents);
      });

    // 2. Carregar Pacientes
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  }, []);

  // --- NAVEGAÇÃO ---
  function nextMonth() { setCurrentDate(addMonths(currentDate, 1)); }
  function prevMonth() { setCurrentDate(subMonths(currentDate, 1)); }
  function jumpToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  // --- LÓGICA DE PACIENTES ---
  const handleClientNameChange = (text: string) => {
    setFormData({ ...formData, title: text });
    if (text.length > 0) {
      const matches = patients.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredPatients(matches);
      setShowSuggestions(true);
    } else { setShowSuggestions(false); }
  };

  const selectPatient = (patient: Patient) => {
    let phoneStr = "";
    if (Array.isArray(patient.contacts)) {
        const firstPhone = patient.contacts.find((c: any) => c.type === 'phone');
        if (firstPhone) phoneStr = firstPhone.value;
    }
    setFormData({ ...formData, title: patient.name, phone: phoneStr });
    setShowSuggestions(false);
  };

  // --- LÓGICA MODAL AUXILIAR (ADICIONAR) ---
  function openAddModal(type: "patient" | "procedure" | "professional" | "location") {
    setAuxType(type);
    setNewItemName("");
    setNewPatientData({
        name: "", cpf: "", rg: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
        phones: [""], emails: [""], addresses: [""], responsibles: [""]
    });
    setIsAuxModalOpen(true);
  }

  const addField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles') => { setNewPatientData(prev => ({ ...prev, [field]: [...prev[field], ""] })); };
  const updateField = (field: 'phones' | 'emails' | 'addresses' | 'responsibles', index: number, value: string) => {
      const newList = [...newPatientData[field]]; newList[index] = value; setNewPatientData(prev => ({ ...prev, [field]: newList }));
  };

  async function handleSaveNewItem() {
    // Salvar Paciente
    if (auxType === "patient") {
        if(!newPatientData.name || !newPatientData.cpf) return alert("Nome e CPF obrigatórios!");
        const contacts = [...newPatientData.phones.filter(p => p).map(p => ({ type: 'phone', value: p })), ...newPatientData.emails.filter(e => e).map(e => ({ type: 'email', value: e }))];
        const payload = {
            name: newPatientData.name, cpf: newPatientData.cpf, rg: newPatientData.rg, healthPlan: newPatientData.healthPlan, bloodType: newPatientData.bloodType, emergencyName: newPatientData.emergencyName, emergencyPhone: newPatientData.emergencyPhone, contacts: contacts, addresses: newPatientData.addresses.filter(a => a).map(a => ({ street: a })), responsibles: newPatientData.responsibles.filter(r => r).map(r => ({ name: r }))
        };
        try {
            const res = await fetch("/api/patients", { method: "POST", body: JSON.stringify(payload) });
            const created = await res.json();
            setPatients(prev => [...prev, created]);
            selectPatient(created);
            setIsAuxModalOpen(false);
        } catch (err) { alert("Erro ao cadastrar."); }
        return;
    }
    // Salvar Item Simples
    if (!newItemName.trim()) return;
    if (auxType === "procedure") { setProceduresList(prev => [...prev, newItemName]); setFormData(prev => ({ ...prev, procedure: newItemName })); }
    else if (auxType === "professional") { setProfessionalsList(prev => [...prev, newItemName]); setFormData(prev => ({ ...prev, professional: newItemName })); }
    else if (auxType === "location") { setLocationsList(prev => [...prev, newItemName]); setFormData(prev => ({ ...prev, location: newItemName })); }
    setIsAuxModalOpen(false);
  }

  // --- CRUD AGENDAMENTO ---
  function handleOpenCreate() {
    setEditingId(null);
    setFormData({
      title: "", phone: "", 
      procedure: proceduresList[0], professional: professionalsList[0], location: locationsList[0],
      date: format(selectedDate, "yyyy-MM-dd"), startTime: "08:00", endTime: "09:00", notify: "nao_notificar", repeat: false, notes: "", type: "consultation"
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(evt: Appointment) {
    setEditingId(evt.id);
    setFormData({
      title: evt.title, phone: evt.phone || "", procedure: evt.procedure || "", professional: evt.professional || "", location: evt.location || "",
      date: format(evt.date, "yyyy-MM-dd"), startTime: evt.startTime, endTime: evt.endTime, notify: evt.notify || "nao_notificar", repeat: evt.repeat, notes: evt.notes || "", type: evt.type
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.title) return alert("Selecione um cliente!");
    const payload = { ...formData, date: new Date(formData.date + "T00:00:00") };
    try {
      if (editingId) {
        const res = await fetch(`/api/appointments/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        const updated = await res.json();
        setEvents(prev => prev.map(e => e.id === editingId ? { ...updated, date: new Date(updated.date) } : e));
      } else {
        const res = await fetch("/api/appointments", { method: "POST", body: JSON.stringify(payload) });
        const created = await res.json();
        setEvents(prev => [...prev, { ...created, date: new Date(created.date) }]);
      }
      setIsModalOpen(false);
    } catch (error) { alert("Erro ao salvar."); }
  }

  async function handleDelete(id: number) {
    if (confirm("Excluir?")) {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
      setIsModalOpen(false);
    }
  }

  // --- RENDERIZAÇÃO ---
  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const selectedDayEvents = events.filter((event) => isSameDay(event.date, selectedDate));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 relative">
      
      {/* --- MODAL AUXILIAR (NOVO PACIENTE/ITEM) --- */}
      {isAuxModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
            <div className={`bg-white rounded-xl shadow-2xl w-full ${auxType === 'patient' ? 'max-w-4xl' : 'max-w-xs'} max-h-[90vh] flex flex-col`}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl"><h4 className="font-bold text-gray-800 text-lg">{auxType === "patient" ? "Novo Cadastro" : "Adicionar Item"}</h4><button onClick={() => setIsAuxModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button></div>
                <div className="overflow-y-auto p-6 flex-1">
                    {auxType === "patient" ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label><input type="text" className="w-full border rounded p-2 focus:ring-2 ring-cyan-100 outline-none" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500 uppercase">CPF</label><input type="text" className="w-full border rounded p-2 focus:ring-2 ring-cyan-100 outline-none" value={newPatientData.cpf} onChange={e => setNewPatientData({...newPatientData, cpf: e.target.value})} /></div></div>
                            <div className="border rounded-lg overflow-hidden"><div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Contatos</div><div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8"><div><label className="text-xs font-bold text-gray-700 mb-2 block">Telefones</label><div className="space-y-2 mb-2">{newPatientData.phones.map((phone, idx) => (<input key={idx} type="text" placeholder="(00) 00000-0000" className="w-full border rounded p-2 text-sm" value={phone} onChange={e => updateField('phones', idx, e.target.value)} />))}</div><button onClick={() => addField('phones')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Telefone</button></div><div><label className="text-xs font-bold text-gray-700 mb-2 block">Emails</label><div className="space-y-2 mb-2">{newPatientData.emails.map((email, idx) => (<input key={idx} type="email" placeholder="exemplo@email.com" className="w-full border rounded p-2 text-sm" value={email} onChange={e => updateField('emails', idx, e.target.value)} />))}</div><button onClick={() => addField('emails')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Email</button></div></div></div>
                            <div className="border rounded-lg overflow-hidden"><div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Endereços</div><div className="p-4"><div className="space-y-2 mb-2">{newPatientData.addresses.map((addr, idx) => (<input key={idx} type="text" placeholder="Rua, Número, Bairro, Cidade..." className="w-full border rounded p-2 text-sm" value={addr} onChange={e => updateField('addresses', idx, e.target.value)} />))}</div><button onClick={() => addField('addresses')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Endereço</button></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="border rounded-lg overflow-hidden h-full"><div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Contato de Emergência</div><div className="p-4 grid grid-cols-2 gap-3"><div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})}/></div><div><label className="text-[10px] font-bold text-gray-500 uppercase">Telefone</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})}/></div><div><label className="text-[10px] font-bold text-gray-500 uppercase">Tipo Sanguíneo</label><select className="w-full border rounded p-1.5 text-sm bg-white" value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})}><option value="">Selecione</option><option value="A+">A+</option><option value="O+">O+</option></select></div><div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Plano de Saúde</label><input type="text" className="w-full border rounded p-1.5 text-sm" value={newPatientData.healthPlan} onChange={e => setNewPatientData({...newPatientData, healthPlan: e.target.value})}/></div></div></div><div className="border rounded-lg overflow-hidden h-full"><div className="bg-cyan-600 px-4 py-2 text-white font-bold text-sm">Responsáveis</div><div className="p-4"><div className="space-y-2 mb-2">{newPatientData.responsibles.map((resp, idx) => (<input key={idx} type="text" placeholder="Nome do Responsável" className="w-full border rounded p-2 text-sm" value={resp} onChange={e => updateField('responsibles', idx, e.target.value)} />))}</div><button onClick={() => addField('responsibles')} className="text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-xs font-bold px-3 py-1.5 rounded transition">Adicionar Responsável</button></div></div></div>
                        </div>
                    ) : (
                        <input type="text" autoFocus placeholder="Digite o nome..." className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-cyan-500" value={newItemName} onChange={e => setNewItemName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveNewItem()}/>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl"><button onClick={() => setIsAuxModalOpen(false)} className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2">Cancelar</button><button onClick={handleSaveNewItem} className="bg-pink-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-pink-700 shadow-md shadow-pink-200">Salvar Cadastro</button></div>
            </div>
        </div>
      )}

      {/* --- MODAL DE AGENDAMENTO (PRINCIPAL) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-600 text-white"><h3 className="font-bold flex items-center gap-2"><CalendarIcon size={18}/>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</h3><button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-5">
                
                {/* CAMPO DE CLIENTE (BUSCA INTELIGENTE) */}
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8 relative">
                        <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">Cliente <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <div className="relative w-full">
                                <input type="text" placeholder="Busque ou digite..." className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-teal-500 outline-none" value={formData.title} onChange={e => handleClientNameChange(e.target.value)} onFocus={() => formData.title && setShowSuggestions(true)} autoFocus />
                                {showSuggestions && filteredPatients.length > 0 && (<div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-20 max-h-40 overflow-y-auto">{filteredPatients.map(p => (<div key={p.id} onClick={() => selectPatient(p)} className="p-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"><span className="font-bold">{p.name}</span> <span className="text-xs text-gray-400">({p.cpf})</span></div>))}</div>)}
                            </div>
                            <button onClick={() => openAddModal("patient")} className="h-10 w-10 flex items-center justify-center bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 border border-teal-200" title="Cadastrar Novo Cliente"><UserPlus size={18}/></button>
                        </div>
                    </div>
                    <div className="col-span-4"><label className="text-xs font-bold text-gray-600 mb-1">Telefone</label><input type="text" className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-100 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Automático..." /></div>
                </div>

                {/* PROCEDIMENTO */}
                <div><label className="text-xs font-bold text-gray-600 mb-1">Procedimentos</label><div className="flex gap-2"><select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white focus:border-teal-500 outline-none" value={formData.procedure} onChange={e => setFormData({...formData, procedure: e.target.value})}><option value="">Selecione...</option>{proceduresList.map(p=><option key={p} value={p}>{p}</option>)}</select><button onClick={() => openAddModal("procedure")} className="h-10 w-10 flex items-center justify-center bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 border border-teal-200"><Pencil size={18}/></button></div></div>

                {/* PROFISSIONAL & LOCAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">Profissional <span className="text-red-500">*</span></label><div className="flex gap-2"><select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white focus:border-teal-500 outline-none" value={formData.professional} onChange={e => setFormData({...formData, professional: e.target.value})}><option value="">Selecione...</option>{professionalsList.map(p=><option key={p} value={p}>{p}</option>)}</select><button onClick={() => openAddModal("professional")} className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200"><Plus size={16}/></button></div></div>
                    <div><label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">Local <span className="text-red-500">*</span></label><div className="flex gap-2"><select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white focus:border-teal-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}><option value="">Selecione...</option>{locationsList.map(l=><option key={l} value={l}>{l}</option>)}</select><button onClick={() => openAddModal("location")} className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200"><Plus size={16}/></button></div></div>
                </div>

                {/* DATA, HORA E NOTIFICAÇÃO */}
                <div className="grid grid-cols-12 gap-4">
                     <div className="col-span-4"><label className="text-xs font-bold text-gray-600 mb-1 flex gap-1">Data <span className="text-red-500">*</span></label><input type="date" className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-teal-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                     <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1 flex gap-1">Início <span className="text-red-500">*</span></label><input type="time" className="w-full h-10 px-2 rounded-lg border border-gray-300 focus:border-teal-500 outline-none text-center" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} /></div>
                     <div className="col-span-2"><label className="text-xs font-bold text-gray-600 mb-1 flex gap-1">Fim <span className="text-red-500">*</span></label><input type="time" className="w-full h-10 px-2 rounded-lg border border-gray-300 focus:border-teal-500 outline-none text-center" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} /></div>
                     <div className="col-span-4"><label className="text-xs font-bold text-gray-600 mb-1 flex gap-1">Notificar? <span className="text-red-500">*</span></label><select className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white focus:border-teal-500 outline-none" value={formData.notify} onChange={e => setFormData({...formData, notify: e.target.value})}><option value="nao_notificar">Não notificar</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option></select></div>
                </div>

                {/* REPETIR E MOTIVO */}
                <div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-700">Repetir?</label><button onClick={() => setFormData({...formData, repeat: !formData.repeat})} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${formData.repeat ? 'bg-teal-600' : 'bg-gray-300'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.repeat ? 'translate-x-5' : 'translate-x-0'}`}></div></button></div>
                <div><label className="text-xs font-bold text-gray-600 mb-1">Motivo da Consulta</label><textarea className="w-full h-20 p-3 rounded-lg border border-gray-300 focus:border-teal-500 outline-none resize-none" placeholder="Descreva o motivo..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>

                {/* FOOTER BOTÕES */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                     {editingId && (<button onClick={() => handleDelete(editingId)} className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-100"><Trash2 size={20}/></button>)}
                     <div className="flex-1 flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Cancelar</button><button onClick={handleSave} className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-200 transition flex items-center gap-2"><Save size={18}/> Salvar</button></div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CABEÇALHO --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Agenda <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100 capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span></h1><p className="text-gray-500 text-sm">Gerencie consultas e horários.</p></div>
        <div className="flex items-center gap-2"><button onClick={jumpToToday} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Hoje</button><button onClick={handleOpenCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-teal-200"><Plus size={18} /><span className="hidden sm:inline">Novo Agendamento</span></button></div>
      </div>

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* CALENDÁRIO */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100"><span className="font-semibold text-lg text-gray-700 capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span><div className="flex items-center gap-1"><button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={20} /></button><button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={20} /></button></div></div>
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">{weekDays.map((day, i) => <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</div>)}</div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {calendarDays.map((day) => {
                    const hasEvents = events.some(evt => isSameDay(evt.date, day));
                    return (
                        <div key={day.toString()} onClick={() => setSelectedDate(day)} className={clsx("relative border-b border-r border-gray-100 p-2 cursor-pointer transition-colors hover:bg-gray-50 flex flex-col items-start justify-start gap-1", !isSameMonth(day, currentDate) ? "bg-gray-50/50 text-gray-400" : "bg-white", isSameDay(day, selectedDate) && "ring-2 ring-inset ring-teal-500 z-10")}>
                            <span className={clsx("text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium", isToday(day) ? "bg-teal-600 text-white" : "text-gray-700")}>{format(day, "d")}</span>
                            {hasEvents && (<div className="flex gap-1 px-1 flex-wrap">{events.filter(e => isSameDay(e.date, day)).map((evt, i) => (<div key={i} className={clsx("w-2 h-2 rounded-full", "bg-indigo-400")} />))}</div>)}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* BARRA LATERAL */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-teal-50 to-white"><h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Selecionado</h2><p className="text-3xl font-bold text-gray-800 mt-1 capitalize">{format(selectedDate, "EEEE", { locale: ptBR })}</p><p className="text-teal-600 font-medium">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })}</p></div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-400"><Clock className="mx-auto mb-3 opacity-20" size={48} /><p className="text-sm">Nenhum agendamento para este dia.</p><button onClick={handleOpenCreate} className="mt-4 text-teal-600 text-sm font-medium hover:underline">+ Adicionar horário</button></div>
                ) : (
                    selectedDayEvents.map((event) => (
                        <div key={event.id} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all relative pr-2">
                            <div className="absolute right-2 top-2 hidden group-hover:flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-gray-100 z-10"><button onClick={(e) => { e.stopPropagation(); handleOpenEdit(event); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={14}/></button><button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14}/></button></div>
                            <div className="flex flex-col items-center pt-1 min-w-[3rem]"><span className="text-sm font-bold text-gray-700">{event.startTime}</span><div className="h-full w-0.5 bg-gray-100 mt-2 group-hover:bg-teal-200 transition-colors"></div></div>
                            <div className="flex-1"><div className={clsx("w-full p-3 rounded-lg border-l-4 shadow-sm transition-colors", "bg-indigo-50 border-indigo-500")}><h4 className="font-semibold text-gray-800 text-sm leading-tight">{event.title}</h4><div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500"><span className="capitalize">{event.procedure || "Consulta"}</span></div></div></div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}