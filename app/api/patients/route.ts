import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET: Buscar todos os pacientes (para a lista e busca)
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(patients);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 });
  }
}

// POST: Criar novo paciente
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica
    if (!body.name || !body.cpf) {
      return NextResponse.json({ error: "Nome e CPF são obrigatórios" }, { status: 400 });
    }

    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        cpf: body.cpf,
        rg: body.rg,
        healthPlan: body.healthPlan,
        bloodType: body.bloodType,
        emergencyName: body.emergencyName,
        emergencyPhone: body.emergencyPhone,
        contacts: body.contacts,       // Salva o JSON direto
        addresses: body.addresses,     // Salva o JSON direto
        responsibles: body.responsibles // Salva o JSON direto
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return NextResponse.json({ error: "Erro ao criar paciente" }, { status: 500 });
  }
}