import type { ModelResponse } from "./types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import { containsCode, containsImages } from "./response-parser"

// Função para chamar os modelos usando a AI SDK
export async function compareModels(prompt: string, modelIds: string[], temperature: number): Promise<ModelResponse[]> {
  // Processamento paralelo das chamadas de API
  const promises = modelIds.map(async (fullModelId) => {
    const startTime = Date.now()
    const [provider, modelId] = fullModelId.split("/")

    try {
      // Implementação real para cada provedor
      let response: string
      let tokensUsed: number | undefined

      // Verificar se temos as chaves de API necessárias
      const apiKeys = getApiKeys()

      if (!apiKeys[`${provider.toUpperCase()}_API_KEY`]) {
        return {
          modelId: fullModelId,
          response: `Chave de API para ${provider} não configurada. Por favor, configure a chave de API nas configurações.`,
          timeTaken: 0,
          error: true,
        }
      }

      // Chamar o modelo apropriado com base no provedor
      switch (provider) {
        case "openai":
          // Implementação real para OpenAI
          try {
            const result = await generateText({
              model: openai(modelId),
              prompt,
              temperature,
            })
            response = result.text
            tokensUsed = result.usage?.totalTokens
          } catch (error) {
            console.error(`Erro ao chamar OpenAI (${modelId}):`, error)
            return {
              modelId: fullModelId,
              response: `Erro ao chamar OpenAI (${modelId}): ${error instanceof Error ? error.message : String(error)}`,
              timeTaken: Date.now() - startTime,
              error: true,
            }
          }
          break

        case "xai":
          // Implementação real para xAI (Grok)
          try {
            const result = await generateText({
              model: xai(modelId),
              prompt,
              temperature,
            })
            response = result.text
            tokensUsed = result.usage?.totalTokens
          } catch (error) {
            console.error(`Erro ao chamar xAI (${modelId}):`, error)
            return {
              modelId: fullModelId,
              response: `Erro ao chamar xAI (${modelId}): ${error instanceof Error ? error.message : String(error)}`,
              timeTaken: Date.now() - startTime,
              error: true,
            }
          }
          break

        // Adicionar casos para outros provedores quando implementados
        default:
          // Simulação para provedores ainda não implementados
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

          // Para fins de demonstração, vamos gerar uma resposta que inclui código e imagem
          if (prompt.toLowerCase().includes("código") || prompt.toLowerCase().includes("code")) {
            response = generateDemoResponseWithCode(provider, modelId, prompt)
          } else if (prompt.toLowerCase().includes("imagem") || prompt.toLowerCase().includes("image")) {
            response = generateDemoResponseWithImage(provider, modelId, prompt)
          } else {
            response = generateDemoResponse(provider, modelId, prompt)
          }

          tokensUsed = Math.floor(100 + Math.random() * 400)
      }

      // Detectar se a resposta contém código ou imagens
      const hasCode = containsCode(response)
      const hasImages = containsImages(response)

      return {
        modelId: fullModelId,
        response,
        timeTaken: Date.now() - startTime,
        tokensUsed,
        containsCode: hasCode,
        containsImages: hasImages,
      }
    } catch (error) {
      console.error(`Erro ao chamar o modelo ${fullModelId}:`, error)
      return {
        modelId: fullModelId,
        response: `Erro ao processar a resposta do modelo ${fullModelId}: ${error instanceof Error ? error.message : String(error)}`,
        timeTaken: Date.now() - startTime,
        error: true,
      }
    }
  })

  // Aguarda todas as chamadas terminarem
  const results = await Promise.all(promises)
  return results
}

// Função para obter as chaves de API do localStorage (no cliente) ou variáveis de ambiente (no servidor)
function getApiKeys(): Record<string, string> {
  // No cliente
  if (typeof window !== "undefined") {
    try {
      const storedKeys = localStorage.getItem("llm-api-keys")
      return storedKeys ? JSON.parse(storedKeys) : {}
    } catch (error) {
      console.error("Erro ao ler chaves de API do localStorage:", error)
      return {}
    }
  }

  // No servidor
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    XAI_API_KEY: process.env.XAI_API_KEY || "",
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "",
    MARITACA_API_KEY: process.env.MARITACA_API_KEY || "",
  }
}

// Funções para gerar respostas de demonstração com diferentes tipos de conteúdo

// Vamos melhorar a função de geração de respostas de demonstração para incluir exemplos de markdown, código e imagens

// Atualizar a função generateDemoResponseWithImage para usar tanto markdown quanto HTML para imagens
function generateDemoResponseWithImage(provider: string, modelId: string, prompt: string): string {
  const height = 400
  const width = 600
  const query = "abstract%20digital%20landscape"

  return `# Resposta com imagem do modelo ${provider}/${modelId}

Baseado no seu prompt, aqui está uma imagem gerada:

![Imagem gerada](/placeholder.svg?height=${height}&width=${width}&query=${query})

Esta imagem foi gerada com base no seu prompt. Em uma implementação real, esta seria uma imagem gerada pelos modelos de linguagem com capacidades multimodais.

Você também pode incluir imagens em HTML:

<img src="/placeholder.svg?key=m4t4j" alt="Diagrama de fluxo" />

## Análise da imagem

A imagem gerada representa uma interpretação visual do prompt fornecido. Os modelos modernos de IA podem gerar imagens com diferentes estilos e características dependendo das instruções recebidas. Você pode solicitar modificações específicas para a imagem, como:

1. Alterações de estilo (realista, cartoon, abstrato)
2. Mudanças de composição
3. Adição ou remoção de elementos

Esta é apenas uma demonstração. Em uma implementação real com modelos como DALL-E, Midjourney ou Stable Diffusion, você receberia imagens geradas de alta qualidade.`
}

// Atualizar a função generateDemoResponseWithCode para incluir exemplos de código em markdown
function generateDemoResponseWithCode(provider: string, modelId: string, prompt: string): string {
  return `# Resposta com código do modelo ${provider}/${modelId}

Aqui está um exemplo de código em Python para resolver o problema:

\`\`\`python
def fibonacci(n):
    """
    Calcula o n-ésimo número da sequência de Fibonacci.
    
    Args:
        n: Posição na sequência (começando em 0)
        
    Returns:
        O n-ésimo número de Fibonacci
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b

# Exemplo de uso
for i in range(10):
    print(f"Fibonacci({i}) = {fibonacci(i)}")
\`\`\`

Também podemos implementar o mesmo algoritmo em JavaScript:

\`\`\`javascript
function fibonacci(n) {
  // Calcula o n-ésimo número da sequência de Fibonacci
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// Exemplo de uso
for (let i = 0; i < 10; i++) {
  console.log(\`Fibonacci(\${i}) = \${fibonacci(i)}\`);
}
\`\`\`

Esta implementação tem complexidade de tempo O(n) e complexidade de espaço O(1).

Podemos visualizar a sequência de Fibonacci com um gráfico:

![Gráfico de Fibonacci](/placeholder.svg?height=300&width=500&query=fibonacci%20sequence%20graph)

## Análise de desempenho

Para valores grandes de n, podemos melhorar o desempenho usando programação dinâmica ou a fórmula de Binet:

\`\`\`python
import math

def fibonacci_binet(n):
    """Calcula Fibonacci usando a fórmula de Binet"""
    phi = (1 + math.sqrt(5)) / 2
    return int(round((phi**n - (1-phi)**n) / math.sqrt(5)))
\`\`\`
`
}

// Atualizar a função generateDemoResponse para incluir exemplos de markdown
function generateDemoResponse(provider: string, modelId: string, prompt: string): string {
  return `# Resposta do modelo ${provider}/${modelId}

Esta é uma resposta simulada para o prompt: "${prompt}"

## Principais pontos

1. Este é um exemplo de resposta formatada em markdown
2. Em uma implementação real, esta seria a resposta gerada pelo modelo de linguagem
3. O texto pode incluir **formatação** e [links](https://example.com)

> Esta implementação para o provedor ${provider} ainda está pendente.

### Exemplos de formatação markdown

Você pode usar markdown para criar:

- **Texto em negrito**
- *Texto em itálico*
- ~~Texto riscado~~
- \`Código inline\`

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado 1   | Dado 2   | Dado 3   |
| Exemplo  | Tabela   | Markdown |

#### Listas numeradas:

1. Primeiro item
2. Segundo item
3. Terceiro item
   1. Sub-item 3.1
   2. Sub-item 3.2
`
}
