/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// --- LISTAR AGENDAMENTOS (GET) ---
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' }, // Ordena por data
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 });
  }
}

// --- CRIAR AGENDAMENTO (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      title, phone, date, startTime, endTime, 
      procedure, professional, location, notify, repeat, notes, color 
    } = body;

    // Tenta encontrar o paciente pelo nome para vincular (opcional)
    const patient = await prisma.patient.findFirst({
        where: { name: { equals: title, mode: 'insensitive' } }
    });

    const appointment = await prisma.appointment.create({
      data: {
        title,
        phone,
        date: new Date(date), // Garante que é objeto Date
        startTime,
        endTime,
        // --- NOVOS CAMPOS ---
        procedure,
        professional,
        location,
        notify,
        repeat,
        notes,
        color,
        // Vincula o ID do paciente se encontrou
        patientId: patient?.id || null 
      },
    });

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}