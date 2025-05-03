import axios from "axios"
import type { APIResponse } from "../types"

export async function callMistralAPI(
  modelId: string,
  prompt: string,
  options?: Record<string, any>,
): Promise<APIResponse> {
  try {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 2048,
        ...options,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      },
    )

    return {
      text: response.data.choices[0]?.message?.content || "",
      tokensUsed: response.data.usage?.total_tokens || 0,
    }
  } catch (error: any) {
    console.error(`Erro ao chamar Mistral (${modelId}):`, error)
    throw new Error(`Erro ao chamar Mistral: ${error.response?.data?.error?.message || error.message}`)
  }
}
