/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, Filter, ChevronDown, Plus, Users, 
  MoreHorizontal, Phone, Mail, X, Trash2,
  Download, Upload, FileSpreadsheet, Merge
} from "lucide-react";
import { differenceInYears } from "date-fns";

export default function ClientesPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS ---
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // --- DADOS DO FORMULÁRIO ---
  const [newPatientData, setNewPatientData] = useState({
    name: "", birthDate: "", age: "", rg: "", cpf: "", instagram: "", 
    profession: "", workplace: "", gender: "", civilStatus: "", referral: "", notes: "",
    healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "",
    phones: [""] as string[], emails: [""] as string[], addresses: [""] as string[], responsibles: [""] as string[]
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (error) { console.error("Erro ao buscar clientes:", error); }
    finally { setLoading(false); }
  }

  // --- FUNÇÃO PARA ABRIR/FECHAR MENU (SIMPLIFICADA) ---
  const toggleMenu = () => {
      setShowActionsMenu(prev => !prev);
  };

  const handleAction = (actionName: string) => {
      alert(`Você clicou em: ${actionName}`);
      setShowActionsMenu(false);
  };

  // --- LÓGICA DO MODAL DE CLIENTE ---
  type ListField = 'phones' | 'emails' | 'addresses' | 'responsibles';

  const addField = (field: ListField) => {
      setNewPatientData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };
  
  const updateField = (field: ListField, index: number, value: string) => {
      setNewPatientData(prev => {
          const newList = [...prev[field]];
          newList[index] = value;
          return { ...prev, [field]: newList };
      });
  };
  
  const removeField = (field: ListField, index: number) => {
      setNewPatientData(prev => ({ 
          ...prev, 
          [field]: prev[field].filter((_, i) => i !== index) 
      }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value;
      let age = "";
      if (date) {
          age = differenceInYears(new Date(), new Date(date)).toString();
      }
      setNewPatientData(prev => ({ ...prev, birthDate: date, age }));
  };

  async function handleSavePatient() {
      if(!newPatientData.name) return alert("Nome é obrigatório!");
      
      try {
        const payload = {
            ...newPatientData,
            birthDate: newPatientData.birthDate ? new Date(newPatientData.birthDate) : null,
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
            alert(`✅ Cliente salvo com sucesso!`);
            setIsClientModalOpen(false);
            setNewPatientData({ name: "", birthDate: "", age: "", rg: "", cpf: "", instagram: "", profession: "", workplace: "", gender: "", civilStatus: "", referral: "", notes: "", healthPlan: "", bloodType: "", emergencyName: "", emergencyPhone: "", phones: [""], emails: [""], addresses: [""], responsibles: [""] });
            fetchPatients(); 
        } else {
            alert("Erro ao salvar.");
        }
      } catch (e) { alert("Erro de conexão."); } 
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cpf && p.cpf.includes(searchTerm))
  );

  const labelStyle = "block text-xs font-bold text-gray-600 mb-1";
  const inputStyle = "w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none bg-white";
  const headerStyle = "bg-[#00acc1] px-4 py-2 text-white font-bold text-sm rounded-t-lg";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER DA PÁGINA */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 relative z-30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Busca e Filtro */}
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative">
                    <input type="text" placeholder="Buscar" className="border border-teal-400 rounded px-3 py-1.5 pl-8 text-sm outline-none focus:ring-1 focus:ring-teal-500 text-gray-600 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    <Search className="absolute left-2.5 top-2 text-teal-500" size={16} />
                </div>
                <button className="text-teal-500 hover:bg-teal-50 p-2 rounded"><Filter size={20}/></button>
            </div>

            <h1 className="text-xl text-gray-600 font-normal">Meus Clientes</h1>

            {/* AÇÕES E BOTÕES */}
            <div className="flex gap-2 relative">
                
                {/* BOTÃO MAIS AÇÕES (CORRIGIDO) */}
                <div className="relative">
                    <button 
                        onClick={toggleMenu} // <--- CLIQUE SIMPLIFICADO
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        Mais Ações <ChevronDown size={14}/>
                    </button>

                    {/* MENU FLUTUANTE (VISÍVEL SE showActionsMenu FOR TRUE) */}
                    {showActionsMenu && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[999] animate-in fade-in zoom-in-95">
                            <button onClick={() => handleAction("Baixar Planilha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                                <Download size={16}/> Baixar Planilha
                            </button>
                            <button onClick={() => handleAction("Editar via Planilha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                                <FileSpreadsheet size={16}/> Editar via Planilha
                            </button>
                            <button onClick={() => handleAction("Adicionar via Planilha")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                                <Upload size={16}/> Adicionar via Planilha
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={() => handleAction("Mesclar Clientes")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2">
                                <Merge size={16}/> Mesclar Clientes
                            </button>
                        </div>
                    )}
                </div>

                {/* BOTÃO CRIAR NOVO */}
                <button 
                    onClick={() => setIsClientModalOpen(true)} 
                    className="bg-[#e91e63] hover:bg-pink-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
                >
                    Criar Novo
                </button>
            </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">Filtros: Nenhum filtro aplicado.</div>
      </div>

      {/* LISTAGEM OU ESTADO VAZIO */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px] flex flex-col relative z-10">
        {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Carregando clientes...</div>
        ) : filteredPatients.length === 0 && searchTerm === "" ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="bg-gray-100 p-6 rounded-full mb-4"><Users size={64} className="text-gray-300" /></div>
                <h3 className="text-lg text-gray-600 font-medium mb-2">Aqui é onde você pode ver, controlar e cadastrar seus clientes.</h3>
                <p className="text-gray-400 text-sm mb-6">Vamos começar?</p>
                <button onClick={() => setIsClientModalOpen(true)} className="border border-teal-500 text-teal-500 hover:bg-teal-50 px-6 py-2 rounded text-sm font-bold transition-colors">
                    Criar meu primeiro cliente
                </button>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Nome</th>
                            <th className="px-6 py-3">Telefone/Email</th>
                            <th className="px-6 py-3">CPF</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{patient.name}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {patient.contacts && patient.contacts.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {patient.contacts.map((c: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-1">
                                                    {c.type === 'phone' ? <Phone size={12}/> : <Mail size={12}/>}
                                                    {c.value}
                                                </div>
                                            ))}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-500">{patient.cpf || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-teal-600"><MoreHorizontal size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODAL NOVO CLIENTE (COMPLETO) --- */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
                    <button onClick={() => setIsClientModalOpen(false)}><X size={24} className="text-gray-400 hover:text-red-500"/></button>
                    <h4 className="text-gray-600 text-lg font-medium">Novo Cliente</h4>
                    <button onClick={handleSavePatient} className="bg-[#e91e63] hover:bg-pink-700 text-white px-6 py-1.5 rounded shadow text-sm font-medium">Salvar</button>
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

                    {/* ENDEREÇOS E RESPONSÁVEIS */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Endereços</div><div className="p-6">{newPatientData.addresses.map((addr, idx) => (<div key={idx} className="flex gap-2 mb-2"><input className={inputStyle} value={addr} onChange={e => updateField('addresses', idx, e.target.value)}/><button type="button" onClick={() => removeField('addresses', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('addresses')} className="border border-pink-400 text-pink-500 px-4 py-1.5 rounded text-sm hover:bg-pink-50">Adicionar Endereço</button></div></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Contato de Emergência</div><div className="p-6 grid grid-cols-2 gap-4"><div className="col-span-2"><label className={labelStyle}>Nome</label><input type="text" className={inputStyle} value={newPatientData.emergencyName} onChange={e => setNewPatientData({...newPatientData, emergencyName: e.target.value})} /></div><div className="col-span-2"><label className={labelStyle}>Plano de Saúde</label><input type="text" className={inputStyle} value={newPatientData.healthPlan} onChange={e => setNewPatientData({...newPatientData, healthPlan: e.target.value})} /></div><div><label className={labelStyle}>Telefone</label><input type="text" className={inputStyle} value={newPatientData.emergencyPhone} onChange={e => setNewPatientData({...newPatientData, emergencyPhone: e.target.value})} /></div><div><label className={labelStyle}>Tipo Sanguíneo</label><select className={inputStyle} value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})}><option value="">Selecione</option><option value="A+">A+</option><option value="O+">O+</option><option value="AB+">AB+</option></select></div></div></div>
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100"><div className={headerStyle}>Responsáveis</div><div className="p-6">{newPatientData.responsibles.map((resp, idx) => (<div key={idx} className="flex gap-2 mb-2"><input className={inputStyle} placeholder="Nome" value={resp} onChange={e => updateField('responsibles', idx, e.target.value)} /><button type="button" onClick={() => removeField('responsibles', idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button></div>))}<button type="button" onClick={() => addField('responsibles')} className="border border-pink-400 text-pink-500 px-4 py-1.5 rounded text-sm hover:bg-pink-50">Adicionar Responsável</button></div></div>
                    </div>

                </div>
            </div>
        </div>
      )}
    </div>
  );
}