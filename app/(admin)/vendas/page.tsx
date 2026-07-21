// app/(admin)/vendas/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, DollarSign, X, Calendar, ChevronDown, Eye, Trash2 } from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ORCAMENTO: { label: "Orçamento", color: "bg-yellow-100 text-yellow-700" },
  APROVADO:  { label: "Aprovado",  color: "bg-green-100 text-green-700"  },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-700"      },
};

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VendasPage() {
  const [sales, setSales]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "", cliente: "", profissional: "", de: "", ate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  const fetchSales = useCallback(async (f = appliedFilters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.status)       params.set("status",       f.status);
    if (f.cliente)      params.set("cliente",      f.cliente);
    if (f.profissional) params.set("profissional", f.profissional);
    if (f.de)           params.set("de",           f.de);
    if (f.ate)          params.set("ate",          f.ate);

    try {
      const res  = await fetch(`/api/sales?${params.toString()}`);
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch { setSales([]); }
    finally   { setLoading(false); }
  }, [appliedFilters]);

  useEffect(() => { fetchSales(); }, []);

  function applyFilters() {
    setAppliedFilters({ ...filters });
    fetchSales(filters);
    setIsFilterOpen(false);
  }

  function clearFilters() {
    const empty = { status: "", cliente: "", profissional: "", de: "", ate: "" };
    setFilters(empty);
    setAppliedFilters(empty);
    fetchSales(empty);
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta venda?")) return;
    await fetch(`/api/sales/${id}`, { method: "DELETE" });
    fetchSales();
  }

  const hasFilters = Object.values(appliedFilters).some(Boolean);

  const inputStyle = "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#00acc1]";

  return (
    <div className="p-6 w-full space-y-0">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-4 rounded-t-lg border border-gray-200">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 border border-[#00acc1] text-[#00acc1] px-4 py-1.5 rounded hover:bg-teal-50 transition-colors"
        >
          Buscar <Search size={16} /> <Filter size={16} />
        </button>
        <h1 className="text-xl font-medium text-gray-700">Vendas e Orçamentos</h1>
        <Link
          href="/vendas/nova"
          className="bg-[#c2185b] hover:bg-[#ad1450] text-white px-6 py-1.5 rounded font-medium transition-colors"
        >
          Nova
        </Link>
      </div>

      {/* FILTROS APLICADOS */}
      <div className="bg-[#f9fae8] p-3 border-x border-b border-gray-200 text-sm text-gray-600 flex items-center justify-between">
        <div>
          <span className="font-medium">Filtros: </span>
          {!hasFilters ? (
            <span>Nenhum filtro aplicado.</span>
          ) : (
            <span className="text-teal-700">
              {[
                appliedFilters.status       && `Status: ${STATUS_LABEL[appliedFilters.status]?.label || appliedFilters.status}`,
                appliedFilters.cliente      && `Cliente: ${appliedFilters.cliente}`,
                appliedFilters.profissional && `Profissional: ${appliedFilters.profissional}`,
                appliedFilters.de           && `De: ${appliedFilters.de}`,
                appliedFilters.ate          && `Até: ${appliedFilters.ate}`,
              ].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-red-500 text-xs hover:underline flex items-center gap-1">
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* LISTA OU EMPTY STATE */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-lg min-h-[400px]">
        {loading ? (
          <div className="p-16 flex items-center justify-center text-gray-400">Carregando...</div>
        ) : sales.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-32 bg-[#e1f5fe] rounded-lg border-2 border-[#b3e5fc] flex flex-col p-3 shadow-sm">
                <div className="w-10 h-2 bg-[#81d4fa] rounded mb-3"></div>
                <div className="w-full h-1.5 bg-[#b3e5fc] rounded mb-2"></div>
                <div className="w-full h-1.5 bg-[#b3e5fc] rounded mb-2"></div>
                <div className="w-3/4 h-1.5 bg-[#b3e5fc] rounded"></div>
              </div>
              <div className="absolute -bottom-4 -left-6 bg-[#ffe082] w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                <DollarSign className="text-[#ffb300]" size={24} strokeWidth={3} />
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md text-lg">
              {hasFilters
                ? "Nenhuma venda encontrada com esses filtros."
                : "Aqui é onde você pode ver, controlar e cadastrar seus orçamentos e vendas. Vamos começar?"}
            </p>
            <Link href="/vendas/nova" className="border border-[#00acc1] text-[#00acc1] px-6 py-2 rounded font-medium hover:bg-teal-50 transition-colors">
              Criar um orçamento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Profissional</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">{sale.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{sale.clientName}</td>
                    <td className="px-4 py-3 text-gray-600">{sale.professionalName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABEL[sale.status]?.color || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[sale.status]?.label || sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {fmt(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/vendas/${sale.id}`} className="text-teal-600 hover:bg-teal-50 p-1.5 rounded">
                          <Eye size={16} />
                        </Link>
                        <button onClick={() => handleDelete(sale.id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE FILTRO */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#00acc1] px-6 py-3 flex justify-between items-center text-white">
              <h2 className="font-medium">Filtrar Vendas e Orçamentos</h2>
              <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select className={inputStyle} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">Todos</option>
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">De</label>
                <div className="flex">
                  <input type="date" className={`${inputStyle} rounded-r-none border-r-0`} value={filters.de} onChange={e => setFilters({ ...filters, de: e.target.value })} />
                  <span className="bg-pink-50 text-[#c2185b] border border-gray-300 rounded-r px-3 flex items-center"><Calendar size={16} /></span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Até</label>
                <div className="flex">
                  <input type="date" className={`${inputStyle} rounded-r-none border-r-0`} value={filters.ate} onChange={e => setFilters({ ...filters, ate: e.target.value })} />
                  <span className="bg-pink-50 text-[#c2185b] border border-gray-300 rounded-r px-3 flex items-center"><Calendar size={16} /></span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                <input type="text" className={inputStyle} value={filters.cliente} onChange={e => setFilters({ ...filters, cliente: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Profissional</label>
                <input type="text" className={inputStyle} value={filters.profissional} onChange={e => setFilters({ ...filters, profissional: e.target.value })} />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-600 px-4 py-2 text-sm hover:bg-gray-100 rounded">Cancelar</button>
              <button onClick={applyFilters} className="bg-[#00acc1] hover:bg-[#0097a7] text-white px-6 py-2 text-sm rounded transition-colors">Filtrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
