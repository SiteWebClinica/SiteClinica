import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// GET: Lista apenas os usuários PENDENTES
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: "PENDING",
      },
      select: { // Selecionamos só o que interessa, nada de senha!
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc', // Os mais recentes primeiro
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}