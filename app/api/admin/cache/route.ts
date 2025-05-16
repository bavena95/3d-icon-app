import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { cleanupCache, getCacheStats } from "@/lib/cache"

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter estatísticas do cache
    const stats = await getCacheStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Erro ao obter estatísticas do cache:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o número de dias do query string
    const url = new URL(req.url)
    const days = Number.parseInt(url.searchParams.get("days") || "30", 10)

    // Limpar o cache
    const deletedCount = await cleanupCache(days)

    return NextResponse.json({
      success: true,
      deletedCount,
    })
  } catch (error) {
    console.error("Erro ao limpar cache:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
