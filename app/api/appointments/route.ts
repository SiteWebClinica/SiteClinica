import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Buscar todos os agendamentos
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' } // Ordenar por data
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 });
  }
}

// POST: Criar novo agendamento
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Converter a string de data que vem do front para objeto Date
    const formattedDate = new Date(data.date);

    const newAppointment = await prisma.appointment.create({
      data: {
        title: data.title,
        phone: data.phone,
        procedure: data.procedure,
        professional: data.professional,
        location: data.location,
        date: formattedDate,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        notify: data.notify,
        repeat: data.repeat,
        type: data.type,
      },
    });

    return NextResponse.json(newAppointment);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}