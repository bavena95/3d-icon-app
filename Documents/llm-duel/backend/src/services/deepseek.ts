import axios from "axios"
import { ApiError } from "../middleware/errorHandler"
import type { LLMResponse } from "../types"
import { containsCode, containsImages } from "../utils/responseParser"

export class DeepseekService {
  private apiKey: string
  private baseUrl = "https://api.deepseek.com/v1"

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY não encontrada nas variáveis de ambiente")
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

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: modelId,
          messages: [{ role: "user", content: prompt }],
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
        model: `deepseek/${modelId}`,
        response: responseText,
        timeTaken: 0, // Será calculado na rota
        tokensUsed: response.data.usage?.total_tokens,
        containsCode: containsCode(responseText),
        containsImages: containsImages(responseText),
      }
    } catch (error: any) {
      console.error("Erro no serviço DeepSeek:", error)
      throw ApiError.internal(
        `Erro ao chamar DeepSeek: ${error.response?.data?.error?.message || error.message}`,
        error,
      )
    }
  }
}
