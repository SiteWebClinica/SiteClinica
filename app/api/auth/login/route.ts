import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 2. SEGURANÇA: Verifica se o Admin já aprovou (Status ACTIVE)
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Seu cadastro ainda está em análise. Aguarde o e-mail de aprovação." },
        { status: 403 }
      );
    }

    // 3. Verifica a senha (compara o que foi digitado com o banco)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 4. Sucesso! Retorna os dados para o navegador
    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword // <--- AQUI ESTÁ O SEGREDO DO PRIMEIRO ACESSO
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}