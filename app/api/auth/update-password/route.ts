import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();
    if (!Number.isInteger(Number(userId)) || typeof newPassword !== "string" || newPassword.length < 8) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const value = (await cookies()).get("clinica.token")?.value;
    if (!value) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    let session: { id?: number };
    try { session = JSON.parse(value) as { id?: number }; } catch { return NextResponse.json({ error: "Sessão inválida." }, { status: 401 }); }
    if (Number(session.id) !== Number(userId)) return NextResponse.json({ error: "Operação não autorizada." }, { status: 403 });
    await prisma.user.update({ where: { id: Number(userId) }, data: { password: await bcrypt.hash(newPassword, 10), mustChangePassword: false } });
    return NextResponse.json({ message: "Senha atualizada." });
  } catch (error) {
    console.error("Erro no primeiro acesso:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a senha." }, { status: 500 });
  }
}
