import { clerkMiddleware } from "@clerk/nextjs/server"

// Usar o middleware do Clerk corretamente
export default clerkMiddleware()

// Configuração mínima do matcher
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
