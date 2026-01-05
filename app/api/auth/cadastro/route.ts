import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // <--- Importamos o carteiro

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // 1. Verifica se já existe
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { error: "Este e-mail já possui uma solicitação ou cadastro." },
        { status: 400 }
      );
    }

    // 2. Gera senha temporária (placeholder) e cria no banco
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "PENDING",
        role: "USER",
      },
    });

    // 3. Configura o envio de e-mail (O Carteiro)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Manda o ALERTA para VOCÊ (Admin)
    try {
      await transporter.sendMail({
        from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
        to: "siteclinicaweb@gmail.com", // <--- O E-mail que vai receber o aviso
        subject: "🔔 Nova Solicitação de Cadastro",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Novo usuário aguardando aprovação!</h2>
            <p>Um novo usuário solicitou acesso ao sistema:</p>
            <ul>
              <li><strong>Nome:</strong> ${name}</li>
              <li><strong>E-mail:</strong> ${email}</li>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
            <br/>
            <a href="http://localhost:3000/usuarios" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Ir para Aprovação
            </a>
          </div>
        `,
      });
      console.log("✅ Aviso enviado para o Admin!");
    } catch (mailError) {
      console.error("Erro ao enviar aviso para admin:", mailError);
      // Não vamos travar o cadastro se o e-mail falhar, apenas logar o erro
    }

    return NextResponse.json({
      message: "Solicitação recebida com sucesso!",
    });

  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro ao criar solicitação." },
      { status: 500 }
    );
  }
}