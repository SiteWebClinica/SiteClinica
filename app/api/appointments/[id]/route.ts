import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: Editar agendamento
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const data = await req.json();

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: data.title,
        phone: data.phone,
        procedure: data.procedure,
        professional: data.professional,
        location: data.location,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        notify: data.notify,
        repeat: data.repeat,
        type: data.type,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE: Excluir agendamento
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}