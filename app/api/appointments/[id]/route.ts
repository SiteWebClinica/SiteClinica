import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// DELETE: Excluir agendamento
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}

// PUT: Atualizar agendamento
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: body.title,
        phone: body.phone,
        procedure: body.procedure,
        professional: body.professional,
        location: body.location,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
        notify: body.notify,
        repeat: body.repeat,
        type: body.type
      },
    });

    return NextResponse.json(updated);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}