// Arquivo para exportar todos os provedores de LLM
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"

// Configurações e funções auxiliares para provedores que não têm SDK oficial no AI SDK
import { callAnthropicAPI } from "./anthropic"
import { callGoogleAPI } from "./google"
import { callMistralAPI } from "./mistral"
import { callDeepseekAPI } from "./deepseek"
import { callMaritacaAPI } from "./maritaca"

// Exportar funções para chamar cada provedor
export const providers = {
  openai: {
    sdk: openai,
    call: async (modelId: string, prompt: string, options?: any) => {
      // OpenAI é tratado diretamente pelo AI SDK
      return null
    },
  },
  xai: {
    sdk: xai,
    call: async (modelId: string, prompt: string, options?: any) => {
      // xAI é tratado diretamente pelo AI SDK
      return null
    },
  },
  anthropic: {
    call: callAnthropicAPI,
  },
  google: {
    call: callGoogleAPI,
  },
  mistral: {
    call: callMistralAPI,
  },
  deepseek: {
    call: callDeepseekAPI,
  },
  maritaca: {
    call: callMaritacaAPI,
  },
}

// Função auxiliar para obter o provedor correto com base no nome
export function getProvider(providerName: string) {
  return providers[providerName as keyof typeof providers]
}

// Função para verificar se um provedor tem SDK integrado ao AI SDK
export function hasSDK(providerName: string): boolean {
  return !!providers[providerName as keyof typeof providers]?.sdk
}
