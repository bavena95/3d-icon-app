export interface ModelResponse {
  modelId: string
  response: string
  timeTaken: number
  tokensUsed?: number
  error?: boolean
  containsCode?: boolean
  containsImages?: boolean
}

export interface SavedComparison {
  prompt: string
  temperature: number
  timestamp: string
  responses: ModelResponse[]
}

export interface ResponseBlock {
  type: "text" | "code" | "image"
  content: string
  language?: string
  alt?: string
}

export interface APIResponse {
  text: string
  tokensUsed?: number
  containsCode?: boolean
  containsImages?: boolean
}

export interface APIErrorResponse {
  error: string
  details?: any
}
