// app/api/admin/approve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";

// POST /api/admin/approve - Aprovação simples (UsuariosPage v1)
// Body: { userId: number, newPassword: string }
export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "userId e senha (mínimo 6 caracteres) são obrigatórios" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        status: "APPROVED",
        active: true,
        password: hashedPassword,
        userType: "comum",
        role: "USER",
      },
    });

    // Envio de e-mail (opcional - funciona se EMAIL_USER e EMAIL_PASS estiverem no .env)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Sistema Clínica" <${process.env.EMAIL_USER}>`,
        to: updatedUser.email,
        subject: "Seu acesso foi aprovado!",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #0d9488;">Acesso Liberado! ✅</h2>
            <p>Olá <strong>${updatedUser.name}</strong>,</p>
            <p>Seu acesso ao sistema foi aprovado. Use as credenciais abaixo para entrar:</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
              <p><strong>Login:</strong> ${updatedUser.email}</p>
              <p><strong>Senha:</strong> ${newPassword}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Recomendamos que você altere sua senha após o primeiro acesso.
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      // E-mail falhou mas aprovação foi feita — não quebra o fluxo
      console.warn("Aviso: e-mail não enviado:", mailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao aprovar:", error);
    return NextResponse.json({ error: "Erro ao aprovar usuário" }, { status: 500 });
  }
}
