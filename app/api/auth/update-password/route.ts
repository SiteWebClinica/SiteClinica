import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // <--- DESLIGA A OBRIGAÇÃO
      },
    });

    return NextResponse.json({ message: "Senha atualizada!" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}