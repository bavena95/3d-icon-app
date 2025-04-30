import { Anthropic } from "@anthropic-ai/sdk"; 
import { ApiError } from "../middleware/errorHandler";
import type { LLMResponse } from "../types";
import { containsCode, containsImages } from "../utils/responseParser";

// Constantes para o formato de prompt da API Completions
const HUMAN_PROMPT = "\n\nHuman:";
const AI_PROMPT = "\n\nAssistant:";

export class ClaudeService {
  private anthropic: Anthropic; 
  // Usar modelos compatíveis com a API Completions, pois 'messages' não está disponível no runtime
  private modelMap: Record<string, string> = {
    text: "claude-2.1", 
    code: "claude-2.1", 
    image: "claude-2.1", // API Completions não lida com imagens
  };

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente");
    }
    try {
        this.anthropic = new Anthropic({ apiKey }); 
    } catch (initError) {
        console.error('>>> [ClaudeService Constructor] FAILED to initialize Anthropic SDK:', initError);
        throw new Error('Falha ao inicializar o cliente Anthropic'); 
    }
  }

  async generateResponse(
    prompt: string,
    mode: "text" | "code" | "image",
    options?: Record<string, any>,
  ): Promise<LLMResponse> {
    try {
      // Forçar o uso de modelo compatível com 'completions' do modelMap
      const modelId = this.modelMap[mode] || "claude-2.1"; 

      const formattedPrompt = `${HUMAN_PROMPT} ${mode === 'code' ? 'Por favor, forneça apenas o código como resposta. ' : ''}${prompt}${AI_PROMPT}`;

       // --- USAR A API COMPLETIONS ---
       const response = await this.anthropic.completions.create({ 
        // Remover a primeira definição de model daqui
        prompt: formattedPrompt,
        max_tokens_to_sample: options?.max_tokens || 4096, 
        temperature: options?.temperature ?? 0.7, 
        stream: false, 
        // Espalhar outras opções primeiro
        ...options, 
        // Definir 'model' AQUI, APÓS o spread, para garantir que ele sobrescreva
        model: modelId, 
      });
      // --- FIM DA CHAMADA À API ---

      const responseText = response.completion || "";

      return {
        model: `anthropic/${modelId}`, 
        response: responseText,
        timeTaken: 0, 
        containsCode: containsCode(responseText),
        containsImages: containsImages(responseText), 
      };
    } catch (error: any) {
      console.error("Erro no serviço Claude:", error); 

      if (error instanceof Anthropic.APIError) {
        throw ApiError.internal(`Erro da API Anthropic (${error.status}): ${error.message}`, error);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal(`Erro ao chamar Claude: ${error.message || 'Erro desconhecido'}`, error);
    }
  }
}