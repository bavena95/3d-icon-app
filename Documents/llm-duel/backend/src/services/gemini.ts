import { GoogleGenerativeAI } from "@google/generative-ai"
import { ApiError } from "../middleware/errorHandler"
import type { LLMResponse } from "../types"
import { containsCode, containsImages } from "../utils/responseParser"

export class GeminiService {
  private genAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY não encontrada nas variáveis de ambiente")
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
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

      const model = this.genAI.getGenerativeModel({ model: modelId })

      // Ajustar o prompt para código se necessário
      const finalPrompt =
        mode === "code" ? `Por favor, responda com código bem formatado e comentado. ${prompt}` : prompt

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.max_tokens || 8192,
          ...options,
        },
      })

      const response = result.response.text()

      return {
        model: `google/${modelId}`,
        response,
        timeTaken: 0, // Será calculado na rota
        containsCode: containsCode(response),
        containsImages: containsImages(response),
      }
    } catch (error: any) {
      console.error("Erro no serviço Gemini:", error)
      throw ApiError.internal(`Erro ao chamar Gemini: ${error.message}`, error)
    }
  }
}
