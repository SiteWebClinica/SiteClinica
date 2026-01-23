/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json([]);

  try {
    const patients = await prisma.patient.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 5,
      include: { contacts: true } // Inclui contatos
    });

    const formatted = patients.map((p: any) => ({
        name: p.name,
        // CORREÇÃO: Pega o primeiro contato do tipo telefone
        phone: p.contacts.find((c: any) => c.type === 'phone')?.value || "" 
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
  }
}