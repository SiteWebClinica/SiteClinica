import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // --- CORREÇÃO AQUI: Adicione o await ---
  const cookieStore = await cookies();
  
  cookieStore.delete("clinica.token");
  
  return NextResponse.json({ success: true });
}