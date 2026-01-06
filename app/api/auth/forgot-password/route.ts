import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto"; // Já vem no Node.js, serve para gerar códigos aleatórios

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 1. Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não dizemos se o email existe ou não, mas aqui vamos retornar erro pra facilitar seus testes
      return NextResponse.json({ error: "E-mail não encontrado no sistema." }, { status: 404 });
    }

    // 2. A REGRA DE OURO (Anti-Burlar) 🔒
    if (user.status === "PENDING") {
      return NextResponse.json(
        { error: "Seu cadastro não foi aprovado ainda, logo não será possível redefinir a senha." },
        { status: 403 }
      );
    }

    // 3. Gera o Token (Código Único) e Validade (1 hora)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora a partir de agora

    // 4. Salva no banco
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 5. Configura o envio de e-mail (seu Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Link usando seu IP (troque pelo seu IP se mudou, ou use localhost se for testar no PC)
    // Se seu IP for 192.168.1.8:
    const resetLink = `http://192.168.1.8:3000/redefinir-senha?token=${resetToken}`;

    // 6. Envia o e-mail
    await transporter.sendMail({
      from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de Senha",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a redefinição de sua senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <br/>
          <a href="${resetLink}" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Minha Senha</a>
          <br/><br/>
          <p style="font-size: 12px; color: #666;">Este link expira em 1 hora.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "E-mail de recuperação enviado!" });

  } catch (error) {
    console.error("Erro ao recuperar senha:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}