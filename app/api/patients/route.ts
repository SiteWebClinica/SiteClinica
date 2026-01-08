import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const newPatient = await prisma.patient.create({
      data: {
        name: data.name,
        cpf: data.cpf,
        rg: data.rg,
        healthPlan: data.healthPlan,
        bloodType: data.bloodType,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
        contacts: data.contacts,     // Salva o array direto
        addresses: data.addresses,   // Salva o array direto
        responsibles: data.responsibles
      },
    });
    return NextResponse.json(newPatient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao cadastrar paciente" }, { status: 500 });
  }
}