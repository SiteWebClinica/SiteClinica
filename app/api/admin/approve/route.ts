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
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 1. Busca os dados do usuário para saber o e-mail dele
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 2. Criptografa a senha e atualiza no banco
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        mustChangePassword: true, // <--- ADICIONE ISSO (Obriga a trocar senha)
      },
    });

    // 3. Configura o envio do E-mail (O Carteiro)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Dispara o E-mail Real
    await transporter.sendMail({
      from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Acesso Aprovado - ClinicaSys",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0070f3;">Olá, ${user.name}!</h2>
          <p>Seu cadastro foi aprovado pelo administrador.</p>
          <hr style="border: 1px solid #eee;" />
          
          <p><strong>Seus dados de acesso:</strong></p>
          <p>E-mail: <strong>${user.email}</strong></p>
          <p>Senha Temporária: <strong style="background: #eee; padding: 4px 8px; border-radius: 4px;">${newPassword}</strong></p>
          
          <hr style="border: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">Por segurança, troque sua senha no primeiro acesso.</p>
          <br/>

          <div style="text-align: center; margin: 20px 0;">
            <a href="http://192.168.1.8:3000/login" target="_blank" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Acessar Sistema
            </a>
          </div>

          <p style="font-size: 12px; color: #888; text-align: center;">
            Se o botão não funcionar, copie e cole o link abaixo no navegador:<br/>
            <a href="http://192.168.1.8:3000/login" style="color: #0070f3;">http://192.168.1.8:3000/login</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Usuário aprovado e e-mail enviado!" });

  } catch (error) {
    console.error("Erro ao aprovar:", error);
    return NextResponse.json({ error: "Erro ao processar aprovação." }, { status: 500 });
  }
}