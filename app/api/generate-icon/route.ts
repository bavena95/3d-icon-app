import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { decrementUserCredits, saveIcon as dbSaveIcon } from "@/lib/db"
import { uploadToR2 } from "@/lib/r2"
import openai from "@/lib/openai"
import { generateIconPrompt } from "@/lib/prompts"
import { checkCache, addToCache } from "@/lib/cache"

export async function POST(req: NextRequest) {
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

    const formData = await req.formData()
    const prompt = formData.get("prompt") as string
    const skipCache = formData.get("skipCache") === "true"

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

    // Verificar se o prompt está no cache, a menos que skipCache seja true
    if (!skipCache) {
      const cachedItem = await checkCache(prompt)

      if (cachedItem) {
        console.log(`Cache hit para prompt: ${prompt}`)

        // Salvar o ícone para o usuário (sem decrementar créditos)
        const icon = await dbSaveIcon(userId, prompt, cachedItem.staticUrl, cachedItem.animatedUrl)

        return NextResponse.json({
          success: true,
          icon: {
            id: icon.id,
            prompt: icon.prompt,
            staticUrl: icon.staticUrl,
            animatedUrl: icon.animatedUrl,
            createdAt: icon.createdAt,
            fromCache: true,
          },
        })
      }

      console.log(`Cache miss para prompt: ${prompt}`)
    } else {
      console.log(`Ignorando cache para prompt: ${prompt}`)
    }

    // Verificar e decrementar créditos
    try {
      await decrementUserCredits(userId)
    } catch (error) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 })
    }

    // Gerar a imagem usando a API da OpenAI com o modelo gpt-image-1
    const enhancedPrompt = generateIconPrompt(prompt)

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json",
    })

    // Obter a imagem em base64
    const imageBase64 = response.data[0].b64_json
    if (!imageBase64) {
      throw new Error("Falha ao gerar imagem: resposta inválida da OpenAI")
    }

    // Converter base64 para buffer
    const imageBuffer = Buffer.from(imageBase64, "base64")

    // Fazer upload da imagem estática para o R2
    const staticKey = `icons/${userId}/${Date.now()}-static.png`
    const staticUrl = await uploadToR2(imageBuffer, staticKey, "image/png", {
      prompt,
      userId,
      type: "static",
    })

    // Por enquanto, usamos a mesma imagem para a versão animada
    // Em uma implementação futura, isso seria substituído pela integração com RunwayML
    const animatedKey = `icons/${userId}/${Date.now()}-animated.png`
    const animatedUrl = await uploadToR2(imageBuffer, animatedKey, "image/png", {
      prompt,
      userId,
      type: "animated",
    })

    // Adicionar ao cache
    await addToCache(prompt, staticUrl, animatedUrl)

    // Salvar o ícone no banco de dados
    const icon = await dbSaveIcon(userId, prompt, staticUrl, animatedUrl)

    return NextResponse.json({
      success: true,
      icon: {
        id: icon.id,
        prompt: icon.prompt,
        staticUrl: icon.staticUrl,
        animatedUrl: icon.animatedUrl,
        createdAt: icon.createdAt,
        fromCache: false,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar ícone:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
