import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { saveIcon as dbSaveIcon } from "@/lib/db"
import { uploadToR2 } from "@/lib/r2"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Parse request body
    const body = await request.json()
    const { imageUrl, prompt } = body

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Call RunwayML API to animate the image
    // Note: This is a simplified example as RunwayML's actual API might differ
    const formData = new FormData()
    formData.append("image", new Blob([imageBuffer]), "icon.png")
    formData.append("prompt", `Animate this 3D icon with subtle rotation and floating movement. ${prompt}`)

    // Simulação: usar a mesma imagem como animação
    const animationBuffer = Buffer.from(imageBuffer)

    // Upload to R2
    const filename = `animation-${Date.now()}.mp4`
    const animatedUrl = await uploadToR2(animationBuffer, filename, "video/mp4", {
      prompt,
      userId,
      type: "animated",
    })

    // Update the icon in the database with the animated URL
    await dbSaveIcon(userId, prompt, imageUrl, animatedUrl)

    return NextResponse.json({ animatedUrl })
  } catch (error) {
    console.error("Error animating icon:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
