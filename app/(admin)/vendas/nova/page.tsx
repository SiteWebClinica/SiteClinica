// app/(admin)/vendas/nova/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Plus, X, Loader2 } from "lucide-react";

const inputStyle  = "w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#00acc1] bg-white";
const labelStyle  = "block text-sm text-gray-600 mb-1";
const sectionHeader = "bg-[#00acc1] text-white px-4 py-2 font-medium text-sm flex justify-between items-center";

type Item = { name: string; quantity: number; unitPrice: string; total: string; generateCredit: boolean };
type Payment = { method: string; amount: string; installments: number; cardBrand: string; acquirer: string; bankAccount: string };

const emptyItem: Item = { name: "", quantity: 1, unitPrice: "0,00", total: "0,00", generateCredit: false };
const emptyPayment: Payment = { method: "Cartão de Crédito", amount: "0,00", installments: 1, cardBrand: "", acquirer: "", bankAccount: "" };

function parseBR(v: string) { return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0; }
function fmtBR(v: number)   { return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function NovaVendaPage() {
  const router = useRouter();
  const [loading, setSaving] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);

  const [form, setForm] = useState({
    clientName: "", professionalName: "", saleDate: new Date().toISOString().split("T")[0],
    status: "ORCAMENTO", notes: "",
    discountType: "R$", discount: "0,00",
  });

  const [items, setItems]       = useState<Item[]>([{ ...emptyItem }]);
  const [payments, setPayments] = useState<Payment[]>([{ ...emptyPayment }]);

  useEffect(() => {
    fetch("/api/professionals")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProfessionals(data);
          setForm(prev => ({ ...prev, professionalName: data[0].name }));
        }
      });
  }, []);

  // Recalcula total do item quando qtd ou unitPrice mudam
  function updateItem(idx: number, field: keyof Item, value: any) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const qty   = field === "quantity"  ? Number(value)        : next[idx].quantity;
        const price = field === "unitPrice" ? parseBR(String(value)) : parseBR(next[idx].unitPrice);
        next[idx].total = fmtBR(qty * price);
      }
      return next;
    });
  }

  function addItem()    { setItems(prev => [...prev, { ...emptyItem }]); }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }

  function addPayment()    { setPayments(prev => [...prev, { ...emptyPayment }]); }
  function removePayment(i: number) { setPayments(prev => prev.filter((_, idx) => idx !== i)); }

  function updatePayment(idx: number, field: keyof Payment, value: any) {
    setPayments(prev => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  }

  // Totais calculados
  const subtotal     = items.reduce((s, i) => s + parseBR(i.total), 0);
  const discountVal  = form.discountType === "%" ? subtotal * (parseBR(form.discount) / 100) : parseBR(form.discount);
  const total        = Math.max(subtotal - discountVal, 0);
  const totalPago    = payments.reduce((s, p) => s + parseBR(p.amount), 0);

  async function handleSave() {
    if (!form.clientName.trim())      return alert("Cliente é obrigatório.");
    if (!form.professionalName.trim()) return alert("Profissional é obrigatório.");
    if (items.every(i => !i.name.trim())) return alert("Adicione ao menos um item.");

    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName:       form.clientName,
          professionalName: form.professionalName,
          saleDate:         form.saleDate,
          status:           form.status,
          notes:            form.notes,
          subtotal,
          discountType: form.discountType,
          discount:     parseBR(form.discount),
          total,
          items: items.filter(i => i.name.trim()).map(i => ({
            name:          i.name,
            quantity:      i.quantity,
            unitPrice:     parseBR(i.unitPrice),
            total:         parseBR(i.total),
            generateCredit: i.generateCredit,
          })),
          payments: payments.map(p => ({
            method:       p.method,
            amount:       parseBR(p.amount),
            installments: p.installments,
            cardBrand:    p.cardBrand   || null,
            acquirer:     p.acquirer    || null,
            bankAccount:  p.bankAccount || null,
          })),
        }),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      router.push("/vendas");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 w-full space-y-6 bg-[#f9fafa] min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#f9fafa] pb-4 border-b border-gray-200">
        <Link href="/vendas" className="text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-medium text-gray-700">Novo Orçamento</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#c2185b] hover:bg-[#ad1450] text-white px-6 py-1.5 rounded font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* DADOS BÁSICOS */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className={sectionHeader}>Dados Básicos</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className={labelStyle}>Cliente <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Digite o nome do cliente" className={inputStyle}
              value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>Status</label>
            <select className={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="ORCAMENTO">Orçamento</option>
              <option value="APROVADO">Aprovado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelStyle}>Data <span className="text-red-500">*</span></label>
              <div className="flex">
                <input type="date" className={`${inputStyle} rounded-r-none border-r-0`}
                  value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} />
                <span className="bg-pink-50 text-[#c2185b] border border-gray-300 rounded-r px-2 flex items-center"><Calendar size={16} /></span>
              </div>
            </div>
            <div>
              <label className={labelStyle}>Profissional <span className="text-red-500">*</span></label>
              {professionals.length > 0 ? (
                <select className={inputStyle} value={form.professionalName} onChange={e => setForm({ ...form, professionalName: e.target.value })}>
                  {professionals.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              ) : (
                <input type="text" className={inputStyle} placeholder="Nome do profissional"
                  value={form.professionalName} onChange={e => setForm({ ...form, professionalName: e.target.value })} />
              )}
            </div>
          </div>
          <div className="md:col-span-4">
            <label className={labelStyle}>Observações</label>
            <textarea rows={2} className={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea>
          </div>
        </div>

        {/* ITENS DA VENDA */}
        <div className={`${sectionHeader} mt-0 border-t border-teal-400`}>
          Itens da Venda
          <button onClick={addItem} className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded">
            <Plus size={14} /> Adicionar Item
          </button>
        </div>

        <div className="p-4 space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex-1">
                <label className={labelStyle}>Produto/Procedimento/Pacote</label>
                <input type="text" placeholder="Nome do item" className={inputStyle}
                  value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} />
              </div>
              <div className="w-20">
                <label className={labelStyle}>Qtd.</label>
                <input type="number" min={1} className={inputStyle}
                  value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} />
              </div>
              <div className="w-32">
                <label className={labelStyle}>Valor Unit.</label>
                <input type="text" className={inputStyle}
                  value={item.unitPrice}
                  onChange={e => updateItem(idx, "unitPrice", e.target.value)}
                  onBlur={e => updateItem(idx, "unitPrice", fmtBR(parseBR(e.target.value)))} />
              </div>
              <div className="w-32">
                <label className={labelStyle}>Total</label>
                <input type="text" disabled className={`${inputStyle} bg-gray-100`} value={item.total} />
              </div>
              <div className="w-28 flex flex-col items-center">
                <label className={labelStyle}>Gerar Crédito?</label>
                <div onClick={() => updateItem(idx, "generateCredit", !item.generateCredit)}
                  className={`w-10 h-5 rounded-full mt-1 relative cursor-pointer border transition-colors ${item.generateCredit ? "bg-teal-500 border-teal-500" : "bg-gray-200 border-gray-300"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-transform ${item.generateCredit ? "translate-x-5" : "translate-x-0.5"}`}></div>
                </div>
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1.5"><X size={16} /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PAGAMENTO + TOTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PAGAMENTO */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className={`${sectionHeader}`}>
            Dados de Pagamento
            <button onClick={addPayment} className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          <div className="p-4 space-y-4">
            {payments.map((p, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-100 relative">
                {payments.length > 1 && (
                  <button onClick={() => removePayment(idx)} className="absolute right-2 top-2 text-red-400 hover:text-red-600"><X size={14} /></button>
                )}
                <div>
                  <label className={labelStyle}>Forma de Pagamento *</label>
                  <select className={inputStyle} value={p.method} onChange={e => updatePayment(idx, "method", e.target.value)}>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Dinheiro</option>
                    <option>PIX</option>
                    <option>Boleto</option>
                    <option>Transferência</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Valor *</label>
                  <input type="text" className={inputStyle} value={p.amount}
                    onChange={e => updatePayment(idx, "amount", e.target.value)}
                    onBlur={e => updatePayment(idx, "amount", fmtBR(parseBR(e.target.value)))} />
                </div>
                <div>
                  <label className={labelStyle}>Parcelas</label>
                  <select className={inputStyle} value={p.installments} onChange={e => updatePayment(idx, "installments", Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
                {(p.method === "Cartão de Crédito" || p.method === "Cartão de Débito") && (
                  <>
                    <div>
                      <label className={labelStyle}>Bandeira</label>
                      <select className={inputStyle} value={p.cardBrand} onChange={e => updatePayment(idx, "cardBrand", e.target.value)}>
                        <option value="">Selecione</option>
                        <option>Visa</option><option>Mastercard</option><option>Elo</option><option>Amex</option><option>Hipercard</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Credenciadora</label>
                      <input type="text" className={inputStyle} placeholder="Cielo, Stone..." value={p.acquirer} onChange={e => updatePayment(idx, "acquirer", e.target.value)} />
                    </div>
                  </>
                )}
                <div>
                  <label className={labelStyle}>Conta Bancária</label>
                  <input type="text" className={inputStyle} value={p.bankAccount} onChange={e => updatePayment(idx, "bankAccount", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAIS */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className={sectionHeader}>Totais</div>
          <div className="p-6 space-y-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">R$ {fmtBR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Desconto</span>
              <div className="flex w-36">
                <select className="border border-gray-300 text-[#00acc1] px-2 py-1 rounded-l text-xs outline-none bg-white"
                  value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                  <option>R$</option><option>%</option>
                </select>
                <input type="text" className="w-full border border-gray-300 border-l-0 rounded-r px-2 py-1 outline-none text-right"
                  value={form.discount}
                  onChange={e => setForm({ ...form, discount: e.target.value })}
                  onBlur={e => setForm({ ...form, discount: fmtBR(parseBR(e.target.value)) })} />
              </div>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Valor Pagamentos</span>
              <span>R$ {fmtBR(totalPago)}</span>
            </div>
            {totalPago !== total && (
              <div className={`flex justify-between text-xs ${totalPago > total ? "text-green-600" : "text-orange-500"}`}>
                <span>{totalPago > total ? "Troco" : "Falta pagar"}</span>
                <span>R$ {fmtBR(Math.abs(totalPago - total))}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100 text-lg font-medium text-gray-800">
              <span>Total</span>
              <span>R$ {fmtBR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
