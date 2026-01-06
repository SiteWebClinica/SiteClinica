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
      // Defina seu IP aqui para facilitar (se mudar, troca só aqui)
      const baseUrl = "http://192.168.1.8:3000"; 

      await transporter.sendMail({
        from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
        to: "siteclinicaweb@gmail.com", // Seu email de admin
        subject: "🔔 Nova Solicitação de Cadastro",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>Novo usuário aguardando aprovação!</h2>
            <p>Um novo usuário solicitou acesso ao sistema:</p>
            <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
              <li><strong>Nome:</strong> ${name}</li>
              <li><strong>E-mail:</strong> ${email}</li>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
            </ul>
            <br/>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${baseUrl}/usuarios" target="_blank" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Ir para Aprovação
              </a>
            </div>

            <p style="font-size: 12px; color: #888; text-align: center;">
              Se o botão não funcionar, clique ou copie o link abaixo:<br/>
              <a href="${baseUrl}/usuarios" style="color: #0070f3;">${baseUrl}/usuarios</a>
            </p>
          </div>
        `,
      });
      console.log("✅ Aviso enviado para o Admin!");
    } catch (mailError) {
      console.error("Erro ao enviar aviso para admin:", mailError);
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