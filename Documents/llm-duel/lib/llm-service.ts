import type { ModelResponse } from "./types"
import { containsCode, containsImages } from "./response-parser"

// Função para comparar modelos usando as API Routes do Next.js
export async function compareModels(
  prompt: string,
  modelIds: string[],
  mode: "text" | "code" | "image" = "text",
  options?: Record<string, any>,
): Promise<ModelResponse[]> {
  console.log("Comparando modelos:", modelIds, "com modo:", mode)

  // Processamento paralelo das chamadas de API
  const promises = modelIds.map(async (fullModelId) => {
    const startTime = Date.now()
    const [provider, modelId] = fullModelId.split("/")

    try {
      // Fazer a chamada para a API Route
      const response = await fetch("/api/llm/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          modelId,
          prompt,
          mode,
          options: {
            temperature: options?.temperature || 0.7,
            ...options,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro na chamada da API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        modelId: fullModelId,
        response: data.response,
        timeTaken: Date.now() - startTime,
        tokensUsed: data.tokensUsed,
        containsCode: data.containsCode || containsCode(data.response),
        containsImages: data.containsImages || containsImages(data.response),
      }
    } catch (error) {
      console.error(`Erro ao chamar o modelo ${fullModelId}:`, error)
      return {
        modelId: fullModelId,
        response: `Erro ao processar a resposta do modelo ${fullModelId}: ${error instanceof Error ? error.message : String(error)}`,
        timeTaken: Date.now() - startTime,
        error: true,
      }
    }
  })

  // Aguarda todas as chamadas terminarem
  const results = await Promise.all(promises)
  return results
}
