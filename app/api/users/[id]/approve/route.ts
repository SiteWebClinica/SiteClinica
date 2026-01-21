import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcryptjs";

// POST /api/users/[id]/approve
export async function POST(
    request: Request, 
    { params }: { params: { id: string } }
) {
  try {
    // 1. Pega o ID da URL e converte para número
    const id = parseInt(params.id);
    
    // 2. Pega os dados que vieram do Frontend
    const body = await request.json();
    const { userType, password } = body;

    // 3. Criptografa a nova senha
    const hashedPassword = await hash(password, 10);

    // 4. Atualiza o usuário no Banco
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            status: "APPROVED",     // Libera o status
            active: true,           // Ativa a conta
            password: hashedPassword, // Atualiza a senha provisória
            userType: userType,     // Define se é admin, comum ou profissional
            role: userType === 'admin' ? 'ADMIN' : 'USER' // Atualiza o role técnico também
        }
    });

    // 5. (Simulação) Aqui você enviaria o email de verdade usando uma lib como 'nodemailer' ou 'Resend'
    console.log(`📧 Enviando email para ${updatedUser.email} com a senha: ${password}`);

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Erro na aprovação:", error);
    return NextResponse.json({ error: "Erro ao aprovar usuário" }, { status: 500 });
  }
}