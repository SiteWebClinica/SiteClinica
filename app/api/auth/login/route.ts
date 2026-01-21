import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await compare(password, user.password))) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json({ error: "Conta pendente de aprovação." }, { status: 403 });
    }

    const tokenValue = JSON.stringify({ id: user.id, email: user.email, role: user.userType });

    // --- CORREÇÃO AQUI: Adicione o await ---
    const cookieStore = await cookies();
    
    cookieStore.set("clinica.token", tokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      userType: user.userType 
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}