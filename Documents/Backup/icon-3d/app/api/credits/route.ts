import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase"
import { getUserCredits, addCreditsToUser, recordPurchase } from "@/lib/db"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Obter créditos do usuário
    const credits = await getUserCredits(userId)

    return NextResponse.json({
      success: true,
      credits,
    })
  } catch (error) {
    console.error("Erro ao obter créditos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    const { amount, credits, provider = "manual" } = await request.json()

    if (!amount || !credits) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Registrar a compra
    await recordPurchase(userId, amount, credits, provider)

    // Adicionar créditos ao usuário
    const updatedUser = await addCreditsToUser(userId, credits)

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
    })
  } catch (error) {
    console.error("Erro ao adicionar créditos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
