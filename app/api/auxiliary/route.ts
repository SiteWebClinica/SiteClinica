import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [professionals, services, locations] = await Promise.all([
      prisma.professional.findMany({ where: { active: true } }),
      prisma.service.findMany({ where: { active: true } }),
      prisma.location.findMany({ where: { active: true } }),
    ]);

    return NextResponse.json({
      professionals,
      services,
      locations
    });
  } catch (error) {
    // Se a tabela não existir ainda, retorna vazio para não quebrar a tela
    return NextResponse.json({ professionals: [], services: [], locations: [] });
  }
}