import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // Pega o ?status=PENDING da URL

  try {
    const users = await prisma.user.findMany({
      where: {
        // Se vier status na URL, filtra. Se não, traz todos.
        status: status ? String(status) : undefined 
      },
      orderBy: { createdAt: 'desc' },
      select: { // Seleciona só o necessário para segurança (não manda a senha)
        id: true,
        name: true,
        email: true,
        status: true,
        userType: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}