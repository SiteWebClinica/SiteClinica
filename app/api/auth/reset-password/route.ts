import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || typeof newPassword !== "string" || newPassword.length < 8) return NextResponse.json({ error: "Use uma senha com pelo menos 8 caracteres." }, { status: 400 });
    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await prisma.user.findFirst({ where: { resetToken: tokenHash, resetTokenExpiry: { gt: new Date() } } });
    if (!user) return NextResponse.json({ error: "Este link é inválido ou expirou." }, { status: 400 });
    await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPassword, 10), mustChangePassword: false, resetToken: null, resetTokenExpiry: null } });
    return NextResponse.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a senha." }, { status: 500 });
  }
}
