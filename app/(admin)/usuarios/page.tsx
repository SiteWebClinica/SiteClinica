"use client";

import { useState, useEffect } from "react";
import { Check, Lock, RotateCcw } from "lucide-react";

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // Busca os dados REAIS assim que a tela abre
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectUser(user: any) {
    setSelectedUser(user);
    setNewPassword("");
  }

  async function handleAprove() {
    if (!newPassword || newPassword.length < 6) {
      alert("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) throw new Error("Erro ao aprovar");

      // Simulação do E-mail
      const emailBody = `
        Olá ${selectedUser.name},
        Seu acesso foi aprovado!
        Login: ${selectedUser.email}
        Senha: ${newPassword}
      `;
      console.log("--- EMAIL ENVIADO ---", emailBody);
      
      alert(`Usuário ${selectedUser.name} aprovado com sucesso!`);
      
      // Atualiza a lista removendo o usuário aprovado
      fetchUsers();
      setSelectedUser(null);

    } catch (error) {
      alert("Erro ao salvar no banco de dados.");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Solicitações Pendentes</h1>
        <button onClick={fetchUsers} className="p-2 hover:bg-gray-200 rounded-full" title="Atualizar Lista">
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-3 font-medium">Nome</th>
              <th className="px-6 py-3 font-medium">E-mail</th>
              <th className="px-6 py-3 font-medium">Data Solicitação</th>
              <th className="px-6 py-3 font-medium text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSelectUser(user)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md font-medium text-sm inline-flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Nenhuma solicitação pendente no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE SENHA (Igual ao anterior, mas conectado) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" />
              Definir Senha
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Usuário</label>
                <input type="text" value={selectedUser.name} disabled className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900">Nova Senha</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Crie a senha de acesso..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}