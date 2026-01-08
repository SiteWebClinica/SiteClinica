"use client";

import { useState } from "react";
import { Save, Eye, EyeOff, User, Bell, Clock, ShieldCheck } from "lucide-react";

export default function NewUserPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  // Dados do Formulário
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    role: "", 
    color: "#0d9488", // Cor padrão (Teal)
    active: true, 
    password: "", 
    serviceStart: "08:00", 
    serviceEnd: "18:00"
  });

  // Notificações (Padrão Ativas)
  const [notifications, setNotifications] = useState({
    newAppointment: true, 
    anamnesis: true, 
    signedDoc: true, 
    reminder: true
  });

  async function handleSave() {
    // Validação Simples
    if (!formData.name || !formData.email || !formData.password) {
        return alert("Por favor, preencha Nome, Email e Senha.");
    }

    // --- O PULO DO GATO ---
    // Criamos o usuário já com TUDO LIBERADO (true)
    const allPermissions = {
        geral: true,
        cliente: true,
        atendimento: true,
        financeiro: true,
        cadastros: true,
        estoque: true,
        clinica: true,
        relatorios: true,
        fiscal: true,
        admin: true,  // Acesso a criar usuários
        public: true  // Acesso ao dashboard
    };

    // Objeto pronto para o Banco de Dados
    const payload = {
        ...formData,
        notifications: notifications,
        permissions: allPermissions, // <--- Aqui vai o acesso total
        commissions: { type: 'percent', value: 0 } 
    };

    console.log("Criando Usuário com Acesso Total:", payload);
    
    // Simulação de Salvamento
    // await fetch('/api/users', { method: 'POST', body: JSON.stringify(payload) });
    
    alert(`Usuário ${formData.name} cadastrado com Permissão Total!`);
    // Aqui você redirecionaria: router.push('/usuarios');
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Novo Usuário
                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full border border-teal-200">Acesso Total</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Preencha os dados básicos. As permissões podem ser restritas posteriormente.</p>
        </div>
        <button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-0.5">
            <Save size={20}/> Salvar Cadastro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (Maior) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. DADOS DE ACESSO */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <User className="text-teal-600" size={20}/>
                    <h3 className="font-bold text-gray-700">Dados Pessoais & Acesso</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Completo *</label>
                        <input type="text" autoFocus className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-50 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Dr. João Silva"/>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email (Login) *</label>
                        <input type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-teal-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="usuario@clinica.com"/>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cargo</label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:border-teal-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Ex: Recepcionista"/>
                    </div>

                    <div className="md:col-span-2 relative">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Senha Inicial *</label>
                        <input type={showPassword ? "text" : "password"} className="w-full border border-gray-200 rounded-lg p-2.5 pr-10 focus:border-teal-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Mínimo 6 caracteres"/>
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. AGENDA */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <Clock className="text-teal-600" size={20}/>
                    <h3 className="font-bold text-gray-700">Configuração de Agenda</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Início Expediente</label>
                        <input type="time" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-teal-500" value={formData.serviceStart} onChange={e => setFormData({...formData, serviceStart: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fim Expediente</label>
                        <input type="time" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-teal-500" value={formData.serviceEnd} onChange={e => setFormData({...formData, serviceEnd: e.target.value})}/>
                    </div>
                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                        <input type="color" className="h-10 w-16 p-0 border-0 rounded cursor-pointer bg-transparent" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}/>
                        <div>
                            <p className="text-sm font-bold text-blue-800">Cor de Identificação</p>
                            <p className="text-xs text-blue-600">Esta cor aparecerá nos agendamentos deste profissional.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* COLUNA DIREITA (Menor) */}
        <div className="space-y-6">
            
            {/* 3. STATUS */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">Usuário Ativo?</h3>
                        <p className="text-xs text-gray-500 mt-1">Desative para bloquear acesso.</p>
                    </div>
                    {/* Toggle Switch Bonito */}
                    <div onClick={() => setFormData({...formData, active: !formData.active})} className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.active ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>
            </section>

            {/* 4. NOTIFICAÇÕES */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <Bell className="text-teal-600" size={20}/>
                    <h3 className="font-bold text-gray-700">Notificações</h3>
                </div>
                <div className="p-6 space-y-4">
                    <Toggle label="Novo Agendamento" checked={notifications.newAppointment} onChange={() => setNotifications(p => ({...p, newAppointment: !p.newAppointment}))} />
                    <Toggle label="Anamnese Preenchida" checked={notifications.anamnesis} onChange={() => setNotifications(p => ({...p, anamnesis: !p.anamnesis}))} />
                    <Toggle label="Documento Assinado" checked={notifications.signedDoc} onChange={() => setNotifications(p => ({...p, signedDoc: !p.signedDoc}))} />
                    <Toggle label="Lembretes do Sistema" checked={notifications.reminder} onChange={() => setNotifications(p => ({...p, reminder: !p.reminder}))} />
                </div>
            </section>

            {/* CARD INFORMATIVO */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="text-teal-600 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-teal-800">Permissões Automáticas</h4>
                    <p className="text-xs text-teal-600 mt-1 leading-relaxed">
                        Este usuário terá acesso completo (Administrador) inicialmente. Você poderá refinar as permissões no perfil após salvar.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// Componente Toggle Reutilizável
function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer" onClick={onChange}>
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
        </div>
    );
}