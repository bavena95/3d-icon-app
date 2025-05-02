import OpenAI from "openai"
import { ApiError } from "../middleware/errorHandler"
import type { LLMResponse } from "../types"
import { containsCode, containsImages } from "../utils/responseParser"

export class OpenAIService {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não encontrada nas variáveis de ambiente")
    }
    this.openai = new OpenAI({ apiKey })
  }

  async generateResponse(
    prompt: string,
    mode: "text" | "code" | "image",
    options?: Record<string, any>,
  ): Promise<LLMResponse> {
    try {
      // Sempre usar o modelo fornecido pelo usuário
      const modelId = options?.model

      if (!modelId) {
        throw ApiError.badRequest("Modelo não especificado")
      }

      if (modelId === "gpt-image-1" || mode === "image") {
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          ...options,
        })

        const imageUrl = response.data?.[0]?.url
        if (!imageUrl) {
          throw ApiError.internal("Falha ao gerar imagem")
        }

        return {
          model: `openai/${modelId}`,
          response: `![Imagem gerada pela OpenAI](${imageUrl})`,
          timeTaken: 0, // Será calculado na rota
          containsImages: true,
        }
      } else {
        // Ajustar o prompt para código se necessário
        const finalPrompt = mode === "code" ? `Por favor, responda com código. ${prompt}` : prompt

        const completion = await this.openai.chat.completions.create({
          model: modelId,
          messages: [{ role: "user", content: finalPrompt }],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens,
          ...options,
        })

        const response = completion.choices[0]?.message?.content || ""

        return {
          model: `openai/${modelId}`,
          response,
          timeTaken: 0, // Será calculado na rota
          tokensUsed: completion.usage?.total_tokens,
          containsCode: containsCode(response),
          containsImages: containsImages(response),
        }
      }
    } catch (error: any) {
      console.error("Erro no serviço OpenAI:", error)
      throw ApiError.internal(`Erro ao chamar OpenAI: ${error.message}`, error)
    }
  }
}
