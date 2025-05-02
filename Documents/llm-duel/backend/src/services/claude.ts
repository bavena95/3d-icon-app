import { Anthropic } from "@anthropic-ai/sdk";
// --- Corrigir Imports ---
import type { LLMResponse } from "../types"; // Usar ../types
import { ApiError } from "../middleware/errorHandler"; // Usar ../middleware/errorHandler
import { containsCode, containsImages } from "../utils/responseParser"; // Usar ../utils/responseParser
// --- Fim Correção Imports ---
import type { Message } from "@anthropic-ai/sdk/resources/messages"; // Manter import para tipo

// Constantes para o formato de prompt da API Completions (para fallback)
const HUMAN_PROMPT = "\n\nHuman:";
const AI_PROMPT = "\n\nAssistant:";

// Tipo inline seguro para blocos de texto (caso import de TextBlock falhe ou para clareza)
interface TextBlock { type: 'text'; text: string; }
function isTextBlock(block: any): block is TextBlock {
    return block && block.type === 'text' && typeof block.text === 'string';
}


export class ClaudeService {
  private anthropic: Anthropic;
  private useMessages: boolean = false; // Controla qual API usar

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente");
    }
    
    try {
      this.anthropic = new Anthropic({ apiKey });
      
      // Verifica se a API de mensagens está disponível em runtime
      this.useMessages = typeof (this.anthropic as any).messages?.create === 'function';
      
      console.log(`[ClaudeService Constructor] Usando API Messages? ${this.useMessages}`);
      if (!this.useMessages) {
         // Log se estiver usando completions (importante para saber qual API foi usada)
         console.log(`[ClaudeService Constructor] API Messages não detectada ou inválida. Usando API Completions como fallback.`);
      }

    } catch (initError: any) {
      console.error('>>> [ClaudeService Constructor] FAILED to initialize Anthropic SDK:', initError);
      throw new Error(`Falha ao inicializar o cliente Anthropic: ${initError.message}`);
    }
  }

  async generateResponse(
    prompt: string,
    mode: "text" | "code" | "image",
    options?: Record<string, any>,
  ): Promise<LLMResponse> {
    let modelId: string | undefined; // Declarar fora para acesso no catch
    try {
      modelId = options?.model;

      if (!modelId) {
        throw ApiError.badRequest("Modelo não especificado. O usuário precisa fornecer um modelo válido da Anthropic.");
      }

      const startTime = Date.now();
      let responseText = "";
      let usage = undefined; // Para armazenar tokens usados, se disponível

      // Remover parâmetros que serão definidos explicitamente das opções genéricas
       const commonOptionsToRemove = ['model', 'system', 'messages', 'temperature', 'max_tokens', 'prompt', 'max_tokens_to_sample'];
      const cleanedOptions = options ? Object.fromEntries(
        Object.entries(options).filter(([key]) => 
          !commonOptionsToRemove.includes(key)
        )
      ) : {};

      if (this.useMessages) {
        console.log(`[ClaudeService] Usando API Messages para modelo: ${modelId}`);
        // --- Usar API de mensagens ---
        // Adicionar 'as any' para suprimir o erro TS2339 que ainda ocorre no seu ambiente
        const message: Message = await (this.anthropic as any).messages.create({
          model: modelId,
          // System prompt só é válido aqui
          system: mode === "code" ? "Você é um assistente especializado em programação. Responda com código bem formatado e comentado." : undefined,
          messages: [{ role: "user", content: prompt }],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens || 4096, // Parâmetro correto é max_tokens
          ...cleanedOptions,
        });

        // Extrair texto de forma mais segura
        const textParts: string[] = [];
        if (message.content && Array.isArray(message.content)) {
            message.content.forEach(block => {
                if (isTextBlock(block)) { // Usar type guard
                    textParts.push(block.text);
                }
            });
        }
        responseText = textParts.join('\n');
        usage = message.usage; // Salvar informações de uso (tokens)

      } else {
        console.log(`[ClaudeService] Usando API Completions (Fallback) para modelo: ${modelId}`);
        // --- Usar API de completions (Fallback) ---
        const systemPromptText = mode === "code"
            ? "Você é um assistente especializado em programação. Responda com código bem formatado e comentado."
            : ""; // System prompt não é um parâmetro direto em completions
        const formattedPrompt = `${systemPromptText}${HUMAN_PROMPT} ${prompt}${AI_PROMPT}`;
        
        // Usar 'completions' que sabemos que existe em runtime
        const response = await this.anthropic.completions.create({
          prompt: formattedPrompt,
          max_tokens_to_sample: options?.max_tokens || 4096, // Parâmetro diferente
          temperature: options?.temperature ?? 0.7,
          ...cleanedOptions,
          model: modelId, // Garante override
        });
        
        responseText = response.completion || "";
        // 'usage' não costuma vir na resposta de completions
      }

      const timeTaken = Date.now() - startTime;

      return {
        model: `anthropic/${modelId}`,
        response: responseText,
        timeTaken,
        // Adicionar tokens usados se disponíveis (só da API messages provavelmente)
        tokensUsed: usage?.output_tokens, 
        containsCode: containsCode(responseText),
        containsImages: containsImages(responseText),
      };
    } catch (error: any) {
      console.error("Erro no serviço Claude:", error);
      const attemptedModel = options?.model || modelId || "não especificado"; 
      
      // Usar instanceof se possível, senão fallback
      if (error instanceof Anthropic.APIError) {
        throw ApiError.internal(`Erro da API Anthropic (${error.status}) ao chamar modelo '${attemptedModel}': ${error.message}`, error);
      } else if (error instanceof ApiError) {
        throw error;
      } else {
        throw ApiError.internal(`Erro ao chamar Claude (modelo '${attemptedModel}'): ${error.message || 'Erro desconhecido'}`, error);
      }
    }
  }
}