import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta é uma versão mínima do middleware que não bloqueia nenhuma rota
export function middleware(request: NextRequest) {
  // Simplesmente permite todas as requisições
  return NextResponse.next()
}

// Configuração mínima do matcher
export const config = {
  matcher: [],
}
