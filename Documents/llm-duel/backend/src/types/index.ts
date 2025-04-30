// Tipos comuns para toda a aplicação

export interface LLMRequestBody {
  prompt: string
  mode: "text" | "code" | "image"
  options?: Record<string, any>
}

export interface LLMResponse {
  model: string
  response: string
  timeTaken: number
  tokensUsed?: number
  containsCode?: boolean
  containsImages?: boolean
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    stack?: string
    details?: any
  }
}
