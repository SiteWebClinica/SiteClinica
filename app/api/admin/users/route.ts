// app/api/admin/users/route.ts
// Substitui o arquivo atual que só tem GET
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/admin/users - Lista usuários PENDENTES (usado em UsuariosPage v1)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
