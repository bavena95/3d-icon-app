import type { ModelResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

/**
 * Função para chamar a API do backend para um modelo específico
 */
export async function callLLMApi(
  provider: string,
  modelId: string,
  prompt: string,
  mode: "text" | "code" | "image",
  options?: Record<string, any>,
): Promise<ModelResponse> {
  const startTime = Date.now()

  try {
    const response = await fetch(`${API_BASE_URL}/${provider}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        mode,
        options: {
          ...options,
          model: modelId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `Erro ao chamar a API: ${response.status}`)
    }

    const data = await response.json()

    return {
      modelId: `${provider}/${modelId}`,
      response: data.response,
      timeTaken: data.timeTaken || Date.now() - startTime,
      tokensUsed: data.tokensUsed,
      containsCode: data.containsCode,
      containsImages: data.containsImages,
    }
  } catch (error) {
    console.error(`Erro ao chamar o modelo ${provider}/${modelId}:`, error)
    return {
      modelId: `${provider}/${modelId}`,
      response: `Erro ao processar a resposta do modelo: ${error instanceof Error ? error.message : String(error)}`,
      timeTaken: Date.now() - startTime,
      error: true,
    }
  }
}

/**
 * Função para comparar múltiplos modelos
 */
export async function compareModels(
  prompt: string,
  modelIds: string[],
  mode: "text" | "code" | "image" = "text",
  options?: Record<string, any>,
): Promise<ModelResponse[]> {
  // Processamento paralelo das chamadas de API
  const promises = modelIds.map(async (fullModelId) => {
    const [provider, modelId] = fullModelId.split("/")
    return callLLMApi(provider, modelId, prompt, mode, options)
  })

  // Aguarda todas as chamadas terminarem
  const results = await Promise.all(promises)
  return results
}
