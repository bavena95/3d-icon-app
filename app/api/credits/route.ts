import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUserCredits, addCreditsToUser, recordPurchase } from "@/lib/db"

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter créditos do usuário
    const credits = await getUserCredits(user.id)

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
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { amount, credits, provider = "manual" } = await request.json()

    if (!amount || !credits) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Registrar a compra
    await recordPurchase(user.id, amount, credits, provider)

    // Adicionar créditos ao usuário
    const updatedUser = await addCreditsToUser(user.id, credits)

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
    })
  } catch (error) {
    console.error("Erro ao adicionar créditos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
