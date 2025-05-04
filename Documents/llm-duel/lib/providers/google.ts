import type { APIResponse } from "../types"

export async function callGoogleAPI(
  modelId: string,
  prompt: string,
  options?: Record<string, any>,
): Promise<APIResponse> {
  try {
    // Não podemos inicializar o cliente aqui no frontend
    // Vamos apenas fazer uma chamada para a API Route
    const response = await fetch("/api/llm/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "google",
        modelId,
        prompt,
        options,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Erro na chamada da API: ${response.status}`)
    }

    const data = await response.json()

    return {
      text: data.response || "",
      tokensUsed: data.tokensUsed || 0,
    }
  } catch (error: any) {
    console.error(`Erro ao chamar Google (${modelId}):`, error)
    throw new Error(`Erro ao chamar Google: ${error.message}`)
  }
}
