import axios from "axios"
import { ApiError } from "../middleware/errorHandler"
import type { LLMResponse } from "../types"
import { containsCode, containsImages } from "../utils/responseParser"

export class MistralService {
  private apiKey: string
  private baseUrl = "https://api.mistral.ai/v1"

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY não encontrada nas variáveis de ambiente")
    }
    this.apiKey = apiKey
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

      // Ajustar o prompt para código se necessário
      const finalPrompt =
        mode === "code" ? `Por favor, responda com código bem formatado e comentado. ${prompt}` : prompt

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: modelId,
          messages: [{ role: "user", content: finalPrompt }],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 4096,
          ...options,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      )

      const responseText = response.data.choices[0]?.message?.content || ""

      return {
        model: `mistral/${modelId}`,
        response: responseText,
        timeTaken: 0, // Será calculado na rota
        tokensUsed: response.data.usage?.total_tokens,
        containsCode: containsCode(responseText),
        containsImages: containsImages(responseText),
      }
    } catch (error: any) {
      console.error("Erro no serviço Mistral:", error)
      throw ApiError.internal(`Erro ao chamar Mistral: ${error.response?.data?.error?.message || error.message}`, error)
    }
  }
}
