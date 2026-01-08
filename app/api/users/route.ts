import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 1. Pega os parâmetros da URL (ex: ?status=PENDING)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // 2. Monta o filtro (Se tiver status, filtra. Se não, traz tudo)
    const whereCondition = status ? { status: status } : {};

    // 3. Busca no banco
    const users = await prisma.user.findMany({
      where: whereCondition,
      orderBy: {
        id: 'desc' // Mostra os mais novos primeiro
      }
    });

    // 4. Retorna a lista
    return NextResponse.json(users);

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}