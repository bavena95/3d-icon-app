import axios from "axios"
import type { APIResponse } from "../types"

export async function callAnthropicAPI(
  modelId: string,
  prompt: string,
  options?: Record<string, any>,
): Promise<APIResponse> {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options?.max_tokens || 2048,
        temperature: options?.temperature || 0.7,
        ...options,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
      },
    )

    return {
      text: response.data.content[0]?.text || "",
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
    }
  } catch (error: any) {
    console.error(`Erro ao chamar Anthropic (${modelId}):`, error)
    throw new Error(`Erro ao chamar Anthropic: ${error.response?.data?.error?.message || error.message}`)
  }
}
