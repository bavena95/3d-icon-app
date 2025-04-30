// Arquivo para exportar todos os provedores de LLM
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

// Adicionar outros provedores conforme necessário
// import { anthropic } from "@ai-sdk/anthropic"
// import { mistral } from "@ai-sdk/mistral"
// etc.

export const providers = {
  openai,
  xai,
  // Adicionar outros provedores quando implementados
}

// Função auxiliar para obter o provedor correto com base no nome
export function getProvider(providerName: string) {
  return providers[providerName as keyof typeof providers]
}
