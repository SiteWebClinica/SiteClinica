import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

// 1. A função OBRIGATÓRIA 'middleware'
export function middleware(request: NextRequest) {
  // Por enquanto, apenas deixa passar tudo (NextResponse.next())
  return NextResponse.next()
}

// 2. Configuração de onde o middleware deve rodar
export const config = {
  // Aqui você define quais rotas vão passar pelo middleware.
  // O matcher abaixo diz: "Rode em tudo, MENOS arquivos estáticos, imagens, etc"
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}