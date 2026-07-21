// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/sales - Lista vendas com filtros opcionais
// Query params: ?status=&cliente=&profissional=&de=&ate=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status       = searchParams.get("status");
  const clientName   = searchParams.get("cliente");
  const professional = searchParams.get("profissional");
  const de           = searchParams.get("de");
  const ate          = searchParams.get("ate");

  try {
    const sales = await prisma.sale.findMany({
      where: {
        ...(status       ? { status } : {}),
        ...(clientName   ? { clientName: { contains: clientName, mode: "insensitive" } } : {}),
        ...(professional ? { professionalName: { contains: professional, mode: "insensitive" } } : {}),
        ...(de || ate ? {
          saleDate: {
            ...(de  ? { gte: new Date(de) }  : {}),
            ...(ate ? { lte: new Date(ate + "T23:59:59") } : {}),
          }
        } : {}),
      },
      include: {
        items:    true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 });
  }
}

// POST /api/sales - Cria nova venda com itens e pagamentos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName, clientId, professionalName,
      saleDate, status, notes,
      subtotal, discountType, discount, total,
      items, payments,
    } = body;

    if (!clientName || !professionalName) {
      return NextResponse.json(
        { error: "Cliente e Profissional são obrigatórios" },
        { status: 400 }
      );
    }

    // Gera código sequencial: ORC-0001, ORC-0002...
    const count = await prisma.sale.count();
    const code = `ORC-${String(count + 1).padStart(4, "0")}`;

    const sale = await prisma.sale.create({
      data: {
        code,
        clientName,
        clientId:         clientId   || null,
        professionalName,
        saleDate:         saleDate   ? new Date(saleDate) : new Date(),
        status:           status     || "ORCAMENTO",
        notes:            notes      || null,
        subtotal:         subtotal   || 0,
        discountType:     discountType || "R$",
        discount:         discount   || 0,
        total:            total      || 0,

        items: {
          create: Array.isArray(items)
            ? items.map((item: any) => ({
                name:           item.name,
                quantity:       Number(item.quantity) || 1,
                unitPrice:      Number(item.unitPrice) || 0,
                total:          Number(item.total)     || 0,
                generateCredit: item.generateCredit    || false,
              }))
            : [],
        },

        payments: {
          create: Array.isArray(payments)
            ? payments.map((p: any) => ({
                method:       p.method,
                amount:       Number(p.amount) || 0,
                installments: Number(p.installments) || 1,
                cardBrand:    p.cardBrand    || null,
                acquirer:     p.acquirer     || null,
                bankAccount:  p.bankAccount  || null,
                dueDate:      p.dueDate ? new Date(p.dueDate) : null,
                status:       "PENDENTE",
              }))
            : [],
        },
      },
      include: { items: true, payments: true },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json({ error: "Erro ao criar venda: " + error.message }, { status: 500 });
  }
}
