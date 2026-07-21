import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";

const genericMessage = "Se o e-mail estiver cadastrado e aprovado, enviaremos as instruções.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "APPROVED" || !user.active) return NextResponse.json({ message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: tokenHash, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) } });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Recuperação solicitada, mas o serviço de e-mail não está configurado.");
      return NextResponse.json({ message: genericMessage });
    }

    const resetLink = `${new URL(request.url).origin}/redefinir-senha?token=${rawToken}`;
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({
      from: `"Clínica Sys" <${process.env.EMAIL_USER}>`, to: user.email, subject: "Redefinição de senha — Clínica Sys",
      html: `<div style="font-family:Arial,sans-serif;color:#334155;max-width:560px;margin:auto"><h2 style="color:#0f766e">Redefinição de senha</h2><p>Olá, ${user.name}.</p><p>Recebemos uma solicitação para alterar sua senha. O link abaixo é válido por uma hora.</p><p style="margin:28px 0"><a href="${resetLink}" style="background:#0f766e;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Criar nova senha</a></p><p style="font-size:12px;color:#94a3b8">Se você não solicitou esta alteração, ignore este e-mail.</p></div>`,
    });
    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error("Erro na recuperação de senha:", error);
    return NextResponse.json({ error: "Não foi possível processar a solicitação." }, { status: 500 });
  }
}
