import axios from "axios"
import type { APIResponse } from "../types"

export async function callGoogleAPI(
  modelId: string,
  prompt: string,
  options?: Record<string, any>,
): Promise<APIResponse> {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.max_tokens || 8192,
          ...options,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GOOGLE_API_KEY,
        },
      },
    )

    return {
      text: response.data.candidates[0]?.content?.parts[0]?.text || "",
      tokensUsed: 0, // Google não fornece contagem de tokens na API
    }
  } catch (error: any) {
    console.error(`Erro ao chamar Google (${modelId}):`, error)
    throw new Error(`Erro ao chamar Google: ${error.response?.data?.error?.message || error.message}`)
  }
}
