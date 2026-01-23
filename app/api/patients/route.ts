/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// --- LISTAR TODOS (GET) ---
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contacts: true, // Traz os telefones e emails
      }
    });
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 });
  }
}

// --- CRIAR NOVO (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contacts, addresses, responsibles, phones, emails, ...patientData } = body;

    // CORREÇÃO: Definindo o tipo explicitamente
    const contactsToCreate: any[] = []; 

    if (Array.isArray(phones)) {
      phones.forEach((phone: string) => {
        if (phone.trim()) contactsToCreate.push({ type: 'phone', value: phone });
      });
    }

    if (Array.isArray(emails)) {
      emails.forEach((email: string) => {
        if (email.trim()) contactsToCreate.push({ type: 'email', value: email });
      });
    }

    let birthDateValid = null;
    if (patientData.birthDate) {
        const dateObj = new Date(patientData.birthDate);
        if (!isNaN(dateObj.getTime())) {
            birthDateValid = dateObj;
        }
    }

    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        birthDate: birthDateValid,
        contacts: {
          create: contactsToCreate,
        },
        addresses: {
          create: Array.isArray(addresses) ? addresses.filter((a: any) => a && a.trim()).map((a: string) => ({ street: a })) : [],
        },
        responsibles: {
          create: Array.isArray(responsibles) ? responsibles.filter((r: any) => r && r.trim()).map((r: string) => ({ name: r })) : [],
        },
      },
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error("❌ ERRO NO BACKEND:", error.message || error);
    return NextResponse.json({ error: "Erro ao criar paciente: " + error.message }, { status: 500 });
  }
}