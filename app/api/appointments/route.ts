import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET: Buscar agenda
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(appointments);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 });
  }
}

// POST: Criar agendamento
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const appointment = await prisma.appointment.create({
      data: {
        title: body.title, // Nome do Cliente
        phone: body.phone,
        procedure: body.procedure,
        professional: body.professional,
        location: body.location,
        date: new Date(body.date), // Importante: Converter string para Date
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
        notify: body.notify,
        repeat: body.repeat,
        type: body.type || "consultation"
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Erro ao agendar:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}