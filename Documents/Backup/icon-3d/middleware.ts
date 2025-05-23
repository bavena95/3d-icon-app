import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rotas que não precisam de autenticação
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/pricing",
  "/how-it-works",
  "/before-after",
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Se for uma rota pública, permitir acesso
  if (publicRoutes.some((route) => path === route || path.startsWith(route + "/"))) {
    return NextResponse.next()
  }

  // Criar cliente Supabase para o middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!session) {
    // Redirecionar para login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
