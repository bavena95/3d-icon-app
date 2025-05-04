import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import axios from "axios"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const { provider, modelId, prompt, mode, options } = await request.json()

    if (!prompt || !provider || !modelId) {
      return NextResponse.json({ error: "Prompt, provider e modelId são obrigatórios" }, { status: 400 })
    }

    console.log(`Processando requisição para ${provider}/${modelId}`)
    console.log(`Modo: ${mode}, Opções:`, options)

    let response = ""
    let tokensUsed = 0

    // Verificar se temos a chave de API necessária
    const apiKeyName = `${provider.toUpperCase()}_API_KEY`
    if (!process.env[apiKeyName]) {
      return NextResponse.json(
        { error: `Chave de API para ${provider} não configurada (${apiKeyName})` },
        { status: 400 },
      )
    }

    // Ajustar o prompt com base no modo
    let finalPrompt = prompt
    if (mode === "code") {
      finalPrompt = `Por favor, responda com código bem formatado e comentado para o seguinte problema:\n\n${prompt}`
    } else if (mode === "image") {
      finalPrompt = `Por favor, descreva detalhadamente uma imagem que represente o seguinte:\n\n${prompt}`
    }

    // Chamar o modelo apropriado com base no provedor
    switch (provider) {
      case "openai":
        try {
          console.log(`Chamando OpenAI modelo ${modelId}`)

          // Para geração de imagens
          if (modelId === "gpt-image-1" || mode === "image") {
            const openaiClient = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY,
            })

            // Remover temperatura das opções apenas para o modelo gpt-image-1
            const imageOptions = { ...options }
            if (modelId === "gpt-image-1") {
              delete imageOptions.temperature
            }

            const imageResponse = await openaiClient.images.generate({
              model: "gpt-image-1",
              prompt: finalPrompt,
              n: 1,
              size: "1024x1024",
              ...imageOptions,
            })

            const imageUrl = imageResponse.data?.[0]?.url
            if (!imageUrl) {
              throw new Error("Falha ao gerar imagem")
            }

            response = `![Imagem gerada pela OpenAI](${imageUrl})`
            tokensUsed = 0 // Não aplicável para imagens
          } else {
            // Para geração de texto
            const result = await generateText({
              model: openai(modelId),
              prompt: finalPrompt,
              temperature: options?.temperature || 0.7,
              maxTokens: options?.max_tokens || 2048,
            })

            response = result.text
            tokensUsed = result.usage?.totalTokens || 0
          }
        } catch (error) {
          console.error(`Erro ao chamar OpenAI (${modelId}):`, error)
          return NextResponse.json(
            { error: `Erro ao chamar OpenAI: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 },
          )
        }
        break

      case "xai":
        try {
          console.log(`Chamando xAI modelo ${modelId}`)
          const result = await generateText({
            model: xai(modelId),
            prompt: finalPrompt,
            temperature: options?.temperature || 0.7,
            maxTokens: options?.max_tokens || 2048,
          })

          response = result.text
          tokensUsed = result.usage?.totalTokens || 0
        } catch (error) {
          console.error(`Erro ao chamar xAI (${modelId}):`, error)
          return NextResponse.json(
            { error: `Erro ao chamar xAI: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 },
          )
        }
        break

      case "google":
        try {
          console.log(`Chamando Google modelo ${modelId} via API REST`)

          // Usar diretamente a API REST do Google Gemini
          const apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models"
          const apiKey = process.env.GOOGLE_API_KEY

          // Configurar as opções de geração
          const generationConfig = {
            temperature: options?.temperature || 0.7,
            maxOutputTokens: options?.max_tokens || 8192,
            ...options,
          }

          // Fazer a requisição para a API REST
          const googleResponse = await axios.post(
            `${apiEndpoint}/${modelId}:generateContent?key=${apiKey}`,
            {
              contents: [{ parts: [{ text: finalPrompt }] }],
              generationConfig,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          // Extrair a resposta do formato da API REST
          response = googleResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || ""
          tokensUsed = 0 // Google não fornece contagem de tokens na API REST
        } catch (error) {
          console.error(`Erro ao chamar Google (${modelId}):`, error)

          // Extrair mensagem de erro mais detalhada da resposta da API, se disponível
          let errorMessage = error instanceof Error ? error.message : String(error)

          if (axios.isAxiosError(error) && error.response?.data?.error) {
            const apiError = error.response.data.error
            errorMessage = `${apiError.message || apiError.status || "Erro desconhecido"}`

            // Adicionar detalhes adicionais se disponíveis
            if (apiError.details) {
              errorMessage += `: ${JSON.stringify(apiError.details)}`
            }
          }

          return NextResponse.json({ error: `Erro ao chamar Google: ${errorMessage}` }, { status: 500 })
        }
        break

      case "anthropic":
        try {
          console.log(`Chamando Anthropic modelo ${modelId}`)

          const anthropicResponse = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
              model: modelId,
              messages: [{ role: "user", content: finalPrompt }],
              max_tokens: options?.max_tokens || 2048,
              temperature: options?.temperature || 0.7,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
              },
            },
          )

          response = anthropicResponse.data.content[0]?.text || ""
          tokensUsed = anthropicResponse.data.usage?.input_tokens + anthropicResponse.data.usage?.output_tokens || 0
        } catch (error) {
          console.error(`Erro ao chamar Anthropic (${modelId}):`, error)
          return NextResponse.json(
            { error: `Erro ao chamar Anthropic: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 },
          )
        }
        break

      case "mistral":
        try {
          console.log(`Chamando Mistral modelo ${modelId}`)

          const mistralResponse = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            {
              model: modelId,
              messages: [{ role: "user", content: finalPrompt }],
              temperature: options?.temperature || 0.7,
              max_tokens: options?.max_tokens || 2048,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
              },
            },
          )

          response = mistralResponse.data.choices[0]?.message?.content || ""
          tokensUsed = mistralResponse.data.usage?.total_tokens || 0
        } catch (error) {
          console.error(`Erro ao chamar Mistral (${modelId}):`, error)
          return NextResponse.json(
            { error: `Erro ao chamar Mistral: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 },
          )
        }
        break

      case "deepseek":
        try {
          console.log(`Chamando DeepSeek modelo ${modelId}`)

          const deepseekResponse = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
              model: modelId,
              messages: [{ role: "user", content: finalPrompt }],
              temperature: options?.temperature || 0.7,
              max_tokens: options?.max_tokens || 2048,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
              },
            },
          )

          response = deepseekResponse.data.choices[0]?.message?.content || ""
          tokensUsed = deepseekResponse.data.usage?.total_tokens || 0
        } catch (error) {
          console.error(`Erro ao chamar DeepSeek (${modelId}):`, error)
          return NextResponse.json(
            { error: `Erro ao chamar DeepSeek: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 },
          )
        }
        break

      default:
        return NextResponse.json({ error: `Provedor ${provider} não implementado ou não suportado` }, { status: 400 })
    }

    return NextResponse.json({
      provider,
      modelId,
      response,
      tokensUsed,
    })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
