import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // 1. Verifica se já existe
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
        // Se existir e estiver PENDING, deletamos o antigo para permitir nova tentativa
        if (userExists.status === 'PENDING') {
            await prisma.user.delete({ where: { email } });
        } else {
            return NextResponse.json(
                { error: "Este e-mail já possui um cadastro ativo." },
                { status: 400 }
            );
        }
    }

    // 2. Gera senha temporária e cria no banco
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "PENDING",
        active: false, // Nasce inativo
        role: "USER",
        permissions: {},
        notifications: {},
      },
    });

    // 3. Configura o Carteiro (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // --- AQUI ESTÁ A MÁGICA DO LINK ---
    // Defina o endereço do seu site (em desenvolvimento é o seu IP ou localhost)
    const baseUrl = "http://localhost:3000"; 
    // Se estiver testando no celular, use seu IP: const baseUrl = "http://192.168.1.8:3000";

    const linkAprovacao = `${baseUrl}/usuarios/pendentes`;

    // 4. Manda o E-mail Completo
    try {
      await transporter.sendMail({
        from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
        to: "siteclinicaweb@gmail.com", // Seu email de admin
        subject: `🔔 Nova Solicitação: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; padding: 20px; max-width: 600px; border-radius: 10px;">
            
            <h2 style="color: #0d9488; text-align: center;">Nova Solicitação de Acesso</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

            <p style="font-size: 16px;">Olá Admin,</p>
            <p style="font-size: 16px;">O seguinte usuário pediu para entrar no sistema:</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                <p style="margin: 5px 0;"><strong>👤 Nome:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>📧 E-mail:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <br/>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin-bottom: 10px; color: #666;">Clique abaixo para revisar e aprovar:</p>
                
                <a href="${linkAprovacao}" 
                   style="background-color: #0d9488; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                   ✅ APROVAR USUÁRIO
                </a>
            </div>

            <p style="font-size: 12px; color: #999; text-align: center;">
                Link direto: <a href="${linkAprovacao}" style="color: #0d9488;">${linkAprovacao}</a>
            </p>
          </div>
        `,
      });
      console.log("✅ Email com LINK enviado para o Admin!");
    } catch (mailError) {
      console.error("Erro ao enviar email:", mailError);
    }

    return NextResponse.json({ message: "Solicitação recebida com sucesso!" });

  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro ao criar solicitação." },
      { status: 500 }
    );
  }
}
