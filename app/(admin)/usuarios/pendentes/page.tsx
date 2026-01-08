"use client";

import { useEffect, useState } from "react";
import { Check, X, Shield, Stethoscope, User, Lock, Mail } from "lucide-react";

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Usuário sendo aprovado
  
  // Dados para aprovação
  const [approvalData, setApprovalData] = useState({
    role: "USER",
    password: ""
  });

  useEffect(() => {
    // Buscar usuários com status PENDING
    fetch("/api/users?status=PENDING")
        .then(res => res.json())
        .then(data => setPendingUsers(data));
  }, []);

  function openApproveModal(user: any) {
    setSelectedUser(user);
    setApprovalData({ role: "USER", password: generateRandomPassword() }); // Gera senha sugerida
  }

  function generateRandomPassword() {
    return Math.random().toString(36).slice(-8);
  }

  async function handleApprove() {
    if(!selectedUser) return;

    // API que aprova, define senha e envia email
    await fetch(`/api/users/${selectedUser.id}/approve`, {
        method: "POST",
        body: JSON.stringify(approvalData)
    });

    alert(`Usuário aprovado! Senha enviada para ${selectedUser.email}`);
    setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setSelectedUser(null);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Solicitações Pendentes</h1>

      <div className="grid gap-4">
        {pendingUsers.length === 0 ? <p className="text-gray-500">Nenhuma solicitação pendente.</p> : 
         pendingUsers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">?</div>
                    <div>
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Aguardando</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={20}/></button>
                    <button onClick={() => openApproveModal(user)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold flex gap-2 items-center">
                        <Check size={18}/> Aprovar
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* MODAL DE APROVAÇÃO */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Aprovar Acesso</h3>
                <p className="text-gray-500 text-sm mb-6">Defina o nível de acesso e a senha inicial para <strong>{selectedUser.name}</strong>.</p>

                <div className="space-y-4">
                    {/* Seleção de Cargo */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Tipo de Usuário</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setApprovalData({...approvalData, role: 'USER'})} className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${approvalData.role === 'USER' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>
                                <User size={20}/> <span className="text-xs font-bold">Comum</span>
                            </button>
                            <button onClick={() => setApprovalData({...approvalData, role: 'PROFESSIONAL'})} className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${approvalData.role === 'PROFESSIONAL' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>
                                <Stethoscope size={20}/> <span className="text-xs font-bold">Profissional</span>
                            </button>
                            <button onClick={() => setApprovalData({...approvalData, role: 'ADMIN'})} className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${approvalData.role === 'ADMIN' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500'}`}>
                                <Shield size={20}/> <span className="text-xs font-bold">Admin</span>
                            </button>
                        </div>
                        {approvalData.role === 'PROFESSIONAL' && (
                            <p className="text-xs text-teal-600 mt-2 bg-teal-50 p-2 rounded">
                                ℹ️ Este usuário aparecerá na lista de médicos na Agenda.
                            </p>
                        )}
                    </div>

                    {/* Definição de Senha */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 block mb-2">Senha Inicial (Enviada por Email)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 p-2 border border-gray-300 rounded-lg font-mono text-gray-800" 
                                value={approvalData.password}
                                onChange={e => setApprovalData({...approvalData, password: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={handleApprove} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Mail size={18}/> Confirmar e Enviar Email
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}