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

    // 2. SEGURANÇA: Verifica se o Admin aprovou
    // IMPORTANTE: No banco está "APPROVED", não "ACTIVE".
    // Também verificamos a coluna 'active' (booleana) por garantia.
    if (user.status !== "APPROVED" || !user.active) {
      return NextResponse.json(
        { error: "Seu cadastro ainda está em análise ou foi desativado." },
        { status: 403 }
      );
    }

    // 3. Verifica a senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 4. Sucesso! Retorna os dados
    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        
        // --- O PULO DO GATO ---
        // Precisamos devolver as permissões para o Menu Lateral funcionar!
        permissions: user.permissions || {} 
      },
      // Se seu front usa token, mande um fake ou gere um JWT aqui. 
      // Se não usa, pode deixar sem.
      token: "token-de-sessao-valido" 
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}