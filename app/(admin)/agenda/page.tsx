/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, X, UserPlus, Trash2, Search
} from "lucide-react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, parseISO, differenceInYears, isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({ name: "Carregando..." });
  
  // --- ESTADO DO CALENDÁRIO ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- MODAIS (ESTADOS SEPARADOS) ---
  const [isModalOpen, setIsModalOpen] = useState(false);       
  const [isClientModalOpen, setIsClientModalOpen] = useState(false); 

  // --- ESTADOS DA BUSCA INTELIGENTE ---
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- FORMULÁRIO DE AGENDAMENTO ---
  const [formData, setFormData] = useState({
    title: "", phone: "", procedure: "Consulta Rotina", professional: "Jessica Soares", location: "Sala Avaliação",
    date: "", startTime: "08:00", endTime: "09:00", notify: "nao_notificar", repeat: false, notes: "", type: "consultation"
  });

  // --- FORMULÁRIO DE NOVO PACIENTE ---
  const [newPatientData, setNewPatientData] = useState({
    name: "", birthDate: "", age: "", rg: "", cpf: "", instagram: "", 
    profession: "", workplace: "", gender: "", civilStatus: "", referral: "", notes: "",
    healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else router.push("/login");
    fetchAppointments();
  }, [currentMonth]);

  async function fetchAppointments() {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (error) { console.error("Erro ao buscar agenda:", error); }
  }

  // --- BUSCA INTELIGENTE DE CLIENTE ---
  const handleClientSearch = (text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
    }

    searchTimeout.current = setTimeout(async () => {
        try {
            const res = await fetch(`/api/patients/search?q=${text}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setSuggestions(data);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        } catch (e) { console.error(e); }
    }, 300);
  };

  const selectSuggestion = (client: any) => {
      setFormData(prev => ({ 
          ...prev, 
          title: client.name, 
          phone: client.phone || prev.phone 
      }));
      setSuggestions([]);
      setShowSuggestions(false);
  };

  // --- NAVEGAÇÃO DO CALENDÁRIO ---
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDayClick = (date: Date) => {
    setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
    setIsModalOpen(true);
  };

  // --- LÓGICA DO CLIENTE NOVO (BLINDADA) ---
  type ListField = 'phones' | 'emails' | 'addresses' | 'responsibles';

  const addField = (field: ListField) => {
      setNewPatientData(prev => ({
          ...prev,
          [field]: [...prev[field], ""]
      }));
  };
  
  const updateField = (field: ListField, index: number, value: string) => {
      setNewPatientData(prev => {
          const newList = [...prev[field]];
          newList[index] = value;
          return { ...prev, [field]: newList };
      });
  };
  
  // Aqui estava o segredo: usar prev => filter
  const removeField = (field: ListField, index: number) => {
      setNewPatientData(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
      }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value;
      let age = "";
      if (date) age = differenceInYears(new Date(), new Date(date)).toString();
      setNewPatientData(prev => ({ ...prev, birthDate: date, age }));
  };

  async function handleSavePatient() {
      if(!newPatientData.name) return alert("Nome é obrigatório!");
      setLoading(true);
      try {
        const payload = {
            ...newPatientData,
            birthDate: newPatientData.birthDate ? new Date(newPatientData.birthDate) : null,
            contacts: [ ...newPatientData.phones.filter(p => p).map(p => ({ type: 'phone', value: p })), ...newPatientData.emails.filter(e => e).map(e => ({ type: 'email', value: e })) ],
            addresses: newPatientData.addresses.filter(a => a).map(a => ({ street: a })),
            responsibles: newPatientData.responsibles.filter(r => r).map(r => ({ name: r }))
        };
        const res = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) {
            alert(`✅ Cliente ${newPatientData.name} salvo!`);
            setIsClientModalOpen(false);
            setFormData(prev => ({ ...prev, title: newPatientData.name }));
            setNewPatientData({ name: "", birthDate: "", age: "", rg: "", cpf: "", instagram: "", profession: "", workplace: "", gender: "", civilStatus: "", referral: "", notes: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "", phones: [""], emails: [""], addresses: [""], responsibles: [""] });
        } else alert("Erro ao salvar.");
      } catch (e) { alert("Erro de conexão."); } finally { setLoading(false); }
  }

  // --- SALVAR AGENDAMENTO ---
  async function handleSaveAppointment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch("/api/appointments", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, date: new Date(formData.date + "T00:00:00") })
        });
        if (response.ok) {
            alert("✅ Agendamento criado!");
            setIsModalOpen(false);
            fetchAppointments();
        } else alert("Erro ao criar agendamento.");
    } catch (error) { alert("Erro de conexão."); } finally { setLoading(false); }
  }

  // --- CONFIGURAÇÃO DO CALENDÁRIO ---
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Estilos
  const inputStyle = "w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none bg-white";
  const labelStyle = "block text-xs font-bold text-gray-600 mb-1";
  const headerStyle = "bg-[#00acc1] px-4 py-2 text-white font-bold text-sm rounded-t-lg";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-800 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h1>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronLeft size={20}/></button>
                    <button onClick={goToToday} className="px-3 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded hover:bg-teal-100">Hoje</button>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-600"><ChevronRight size={20}/></button>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={() => { setFormData(prev => ({...prev, date: format(new Date(), 'yyyy-MM-dd')})); setIsModalOpen(true); }} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                <Plus size={20}/> <span className="hidden sm:inline">Novo Agendamento</span>
             </button>
        </div>
      </header>

      {/* CALENDÁRIO GRID */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col">
        <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-bold text-gray-400 uppercase tracking-wide">{day}</div>
            ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2 min-h-[600px]">
            {calendarDays.map((day, idx) => {
                const dayAppts = appointments.filter(appt => isSameDay(parseISO(appt.date), day));
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                    <div key={idx} onClick={() => handleDayClick(day)} className={`border rounded-lg p-2 flex flex-col gap-1 cursor-pointer transition-all hover:shadow-md relative overflow-hidden group ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-400'} ${isTodayDate ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}>
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-bold ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'} ${isTodayDate ? 'text-teal-600' : ''}`}>{format(day, 'd')}</span>
                            <div className="opacity-0 group-hover:opacity-100 bg-teal-50 text-teal-600 p-0.5 rounded transition-opacity"><Plus size={14} /></div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                            {dayAppts.map(appt => (
                                <div key={appt.id} className="text-[10px] bg-teal-50 text-teal-800 px-1 py-0.5 rounded border border-teal-100 truncate font-medium flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div> {appt.startTime} {appt.title}
                                </div>
                            ))}
                            {dayAppts.length > 3 && <div className="text-[10px] text-gray-400 text-center font-bold">+ {dayAppts.length - 3} mais</div>}
                        </div>
                    </div>
                );
            })}
        </div>
      </main>

      {/* --- MODAL 1: NOVO AGENDAMENTO (COM BUSCA!) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-teal-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2"><CalendarIcon size={20} /> Novo Agendamento</h2>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveAppointment} className="p-6 overflow-y-auto space-y-4">
                    
                    {/* CAMPO DE CLIENTE COM BUSCA INTELIGENTE */}
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <label className={labelStyle}>Cliente <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    required 
                                    className={`${inputStyle} pr-8`} 
                                    value={formData.title} 
                                    onChange={(e) => handleClientSearch(e.target.value)} 
                                    placeholder="Digite para buscar..." 
                                    autoComplete="off"
                                />
                                <Search className="absolute right-2 top-2.5 text-gray-400" size={16}/>
                            </div>
                            
                            {/* LISTA DE SUGESTÕES */}
                            {showSuggestions && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                                    {suggestions.map((client, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => selectSuggestion(client)}
                                            className="p-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
                                        >
                                            <p className="font-bold">{client.name}</p>
                                            {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={() => setIsClientModalOpen(true)} className="bg-teal-100 text-teal-700 px-3 py-2 rounded hover:bg-teal-200 border border-teal-200 h-[38px] mb-[1px]" title="Novo Cadastro"><UserPlus size={20}/></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                        <div><label className={labelStyle}>Procedimento</label><select className={inputStyle} value={formData.procedure} onChange={e => setFormData({...formData, procedure: e.target.value})}><option>Consulta Rotina</option><option>Avaliação</option></select></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className={labelStyle}>Data</label><input type="date" required className={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                        <div><label className={labelStyle}>Início</label><input type="time" required className={inputStyle} value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} /></div>
                        <div><label className={labelStyle}>Fim</label><input type="time" required className={inputStyle} value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end pt-4"><button type="submit" disabled={loading} className="bg-teal-600 text-white px-6 py-2 rounded font-bold hover:bg-teal-700">{loading ? "..." : "Salvar"}</button></div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL 2: NOVO CLIENTE (COMPLETO) --- */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
                    <button onClick={() => setIsClientModalOpen(false)}><X size={24} className="text-gray-400 hover:text-red-500"/></button>
                    <h4 className="text-gray-600 text-lg font-medium">Novo Cliente</h4>
                    <button onClick={handleSavePatient} disabled={loading} className="bg-[#e91e63] hover:bg-pink-700 text-white px-6 py-1.5 rounded shadow text-sm font-medium">
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar space-y-6 bg-[#f5f5f5]">
                    {/* DADOS BÁSICOS */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                        <div className={headerStyle}>Dados Básicos</div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2"><label className={labelStyle}>Nome <span className="text-red-500">*</span></label><input type="text" className={inputStyle} value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} /></div>
                            <div><label className={labelStyle}>Data de Nascimento</label><input type="date" className={inputStyle} value={newPatientData.birthDate} onChange={handleBirthDateChange} /></div>
                            <div><label className={labelStyle}>Idade</label><input type="text" disabled className={`${inputStyle} bg-gray-100`} value={newPatientData.age} /></div>
                            <div><label className={labelStyle}>RG</label><input type="text" className={inputStyle} value={newPatientData.rg} onChange={e => setNewPatientData({...newPatientData, rg: e.target.value})} /></div>
                            <div><label className={labelStyle}>CPF/CNPJ</label><input type="text" className={inputStyle} value={newPatientData.cpf} onChange={e => setNewPatientData({...newPatientData, cpf: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className={labelStyle}>Instagram</label><input type="text" className={inputStyle} value={newPatientData.instagram} onChange={e => setNewPatientData({...newPatientData, instagram: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className={labelStyle}>Profissão</label><input type="text" className={inputStyle} value={newPatientData.profession} onChange={e => setNewPatientData({...newPatientData, profession: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className={labelStyle}>Local de Trabalho</label><input type="text" className={inputStyle} value={newPatientData.workplace} onChange={e => setNewPatientData({...newPatientData, workplace: e.target.value})} /></div>
                            <div><label className={labelStyle}>Gênero</label><select className={inputStyle} value={newPatientData.gender} onChange={e => setNewPatientData({...newPatientData, gender: e.target.value})}><option value="">Selecione</option><option value="Feminino">Feminino</option><option value="Masculino">Masculino</option></select></div>
                            <div><label className={labelStyle}>Estado Civil</label><select className={inputStyle} value={newPatientData.civilStatus} onChange={e => setNewPatientData({...newPatientData, civilStatus: e.target.value})}><option value="">Selecione</option><option value="Solteiro">Solteiro</option><option value="Casado">Casado</option></select></div>
                            <div className="md:col-span-2"><label className={labelStyle}>Indicação</label><select className={inputStyle} value={newPatientData.referral} onChange={e => setNewPatientData({...newPatientData, referral: e.target.value})}><option value="">Selecione</option><option value="Instagram">Instagram</option><option value="Google">Google</option></select></div>
                            <div className="md:col-span-4"><label className={labelStyle}>Observações</label><textarea rows={2} className={inputStyle} value={newPatientData.notes} onChange={e => setNewPatientData({...newPatientData, notes: e.target.value})}></textarea></div>
                        </div>
                    </div>

                    {/* CONTATOS */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                        <div className={headerStyle}>Contatos</div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-sm font-bold text-gray-800 mb-2 block">Telefones</label>
                                {newPatientData.phones.map((phone, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input type="text" className={inputStyle} placeholder="(00) 00000-0000" value={phone} onChange={e => updateField('phones', idx, e.target.value)} />
                                        {/* BOTÃO CORRIGIDO AQUI EMBAIXO */}
                                        <button type="button" onClick={() => removeField('phones', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addField('phones')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Telefone</button>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-800 mb-2 block">Emails</label>
                                {newPatientData.emails.map((email, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input type="email" className={inputStyle} placeholder="email@exemplo.com" value={email} onChange={e => updateField('emails', idx, e.target.value)} />
                                        <button type="button" onClick={() => removeField('emails', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addField('emails')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Email</button>
                            </div>
                        </div>
                    </div>

                    {/* ENDEREÇOS */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                        <div className={headerStyle}>Endereços</div>
                        <div className="p-6">
                            {newPatientData.addresses.map((addr, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input type="text" className={inputStyle} placeholder="Endereço Completo" value={addr} onChange={e => updateField('addresses', idx, e.target.value)} />
                                    <button type="button" onClick={() => removeField('addresses', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addField('addresses')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Endereço</button>
                        </div>
                    </div>

                    {/* EMERGÊNCIA E RESPONSÁVEIS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                            <div className={headerStyle}>Contato de Emergência</div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className={labelStyle}>Nome</label><input type="text" className={inputStyle} value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})} /></div>
                                <div className="col-span-2"><label className={labelStyle}>Plano de Saúde</label><input type="text" className={inputStyle} value={newPatientData.healthPlan} onChange={e => setNewPatientData({...newPatientData, healthPlan: e.target.value})} /></div>
                                <div><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})} /></div>
                                <div><label className={labelStyle}>Tipo Sanguíneo</label><select className={inputStyle} value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})}><option value="">Selecione</option><option value="A+">A+</option><option value="O+">O+</option><option value="AB+">AB+</option></select></div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                            <div className={headerStyle}>Responsáveis</div>
                            <div className="p-6">
                                {newPatientData.responsibles.map((resp, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input type="text" className={inputStyle} placeholder="Nome do Responsável" value={resp} onChange={e => updateField('responsibles', idx, e.target.value)} />
                                        <button type="button" onClick={() => removeField('responsibles', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addField('responsibles')} className="border border-pink-400 text-pink-500 hover:bg-pink-50 px-4 py-1.5 rounded text-sm font-medium mt-1">Adicionar Responsável</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

    </div>
  );
}