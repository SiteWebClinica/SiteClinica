import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { role, password } = await req.json();
    const id = parseInt(params.id);

    // 1. Criptografar a senha que o Admin criou
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: "APPROVED",
        active: true,
        role: role,
        password: hashedPassword,
        // Define permissões padrão baseadas no cargo
        permissions: role === 'ADMIN' ? { admin: true, public: true, geral: true, financeiro: true } : { public: true, geral: true }
      }
    });

    // 3. SIMULAR ENVIO DE EMAIL (Aqui entraria o Nodemailer/Resend)
    console.log("======================================");
    console.log(`📧 EMAIL ENVIADO PARA: ${updatedUser.email}`);
    console.log(`Assunto: Bem-vindo ao Gestek!`);
    console.log(`Olá ${updatedUser.name}, seu acesso foi aprovado.`);
    console.log(`Sua senha temporária é: ${password}`);
    console.log("======================================");

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Erro ao aprovar" }, { status: 500 });
  }
}