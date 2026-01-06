import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Busca usuário pelo token e verifica se não expirou
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // gt = greater than (maior que agora)
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    // 2. Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Atualiza a senha e LIMPA o token (para não usar o mesmo link duas vezes)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao resetar:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}