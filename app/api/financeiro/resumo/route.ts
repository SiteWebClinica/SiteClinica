// app/api/financeiro/resumo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const hoje     = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    const fimDia    = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    // A RECEBER HOJE: pagamentos PENDENTES com dueDate = hoje
    const aReceberHoje = await prisma.salePayment.aggregate({
      where: {
        status:  "PENDENTE",
        dueDate: { gte: inicioDia, lte: fimDia },
      },
      _sum: { amount: true },
    });

    // A RECEBER MÊS: pagamentos PENDENTES com dueDate = este mês
    const aReceberMes = await prisma.salePayment.aggregate({
      where: {
        status:  "PENDENTE",
        dueDate: { gte: inicioMes, lte: fimMes },
      },
      _sum: { amount: true },
    });

    // RECEBIDO HOJE: pagamentos PAGOS com paidAt = hoje
    const recebidoHoje = await prisma.salePayment.aggregate({
      where: {
        status: "PAGO",
        paidAt: { gte: inicioDia, lte: fimDia },
      },
      _sum: { amount: true },
    });

    // TOTAL DE VENDAS DO MÊS (vendas aprovadas)
    const vendasMes = await prisma.sale.aggregate({
      where: {
        status:   "APROVADO",
        saleDate: { gte: inicioMes, lte: fimMes },
      },
      _sum:   { total: true },
      _count: { id: true },
    });

    // ORÇAMENTOS ABERTOS
    const orcamentosAbertos = await prisma.sale.count({
      where: { status: "ORCAMENTO" },
    });

    return NextResponse.json({
      aReceberHoje:    aReceberHoje._sum.amount    || 0,
      aReceberMes:     aReceberMes._sum.amount     || 0,
      recebidoHoje:    recebidoHoje._sum.amount    || 0,
      totalVendasMes:  vendasMes._sum.total        || 0,
      qtdVendasMes:    vendasMes._count.id         || 0,
      orcamentosAbertos,
    });
  } catch (error) {
    console.error("Erro no resumo financeiro:", error);
    return NextResponse.json({
      aReceberHoje: 0, aReceberMes: 0, recebidoHoje: 0,
      totalVendasMes: 0, qtdVendasMes: 0, orcamentosAbertos: 0,
    });
  }
}
