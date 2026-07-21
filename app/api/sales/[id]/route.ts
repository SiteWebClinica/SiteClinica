// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/sales/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(params.id) },
      include: { items: true, payments: true },
    });
    if (!sale) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 });
  }
}

// PUT /api/sales/[id] - Atualiza status ou dados da venda
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const id = Number(params.id);

    // Remove itens e pagamentos antigos e recria (replace)
    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.salePayment.deleteMany({ where: { saleId: id } });

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        clientName:       body.clientName,
        clientId:         body.clientId      || null,
        professionalName: body.professionalName,
        saleDate:         body.saleDate ? new Date(body.saleDate) : undefined,
        status:           body.status,
        notes:            body.notes         || null,
        subtotal:         body.subtotal      || 0,
        discountType:     body.discountType  || "R$",
        discount:         body.discount      || 0,
        total:            body.total         || 0,
        items: {
          create: Array.isArray(body.items)
            ? body.items.map((item: any) => ({
                name:           item.name,
                quantity:       Number(item.quantity)  || 1,
                unitPrice:      Number(item.unitPrice) || 0,
                total:          Number(item.total)     || 0,
                generateCredit: item.generateCredit    || false,
              }))
            : [],
        },
        payments: {
          create: Array.isArray(body.payments)
            ? body.payments.map((p: any) => ({
                method:       p.method,
                amount:       Number(p.amount)       || 0,
                installments: Number(p.installments) || 1,
                cardBrand:    p.cardBrand   || null,
                acquirer:     p.acquirer    || null,
                bankAccount:  p.bankAccount || null,
                dueDate:      p.dueDate ? new Date(p.dueDate) : null,
                status:       p.status      || "PENDENTE",
              }))
            : [],
        },
      },
      include: { items: true, payments: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao atualizar: " + error.message }, { status: 500 });
  }
}

// DELETE /api/sales/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.sale.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
