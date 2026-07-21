// app/api/professionals/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/professionals - Lista todos os profissionais ativos
export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(professionals);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar profissionais" }, { status: 500 });
  }
}

// POST /api/professionals - Cria um novo profissional
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, specialty, register, phone, email, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const professional = await prisma.professional.create({
      data: {
        name,
        specialty: specialty || null,
        register: register || null,
        phone: phone || null,
        email: email || null,
        color: color || "blue",
        active: true,
      },
    });

    return NextResponse.json(professional, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar profissional:", error);
    return NextResponse.json({ error: "Erro ao criar profissional" }, { status: 500 });
  }
}
