"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { compareModels } from "@/lib/llm-service"
import { ArrowLeftRight, Loader2, Save, Zap, Check, Code, FileText, ImageIcon, Lock, Unlock } from "lucide-react"
import type { ModelResponse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ResponseViewer from "./response-viewer"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Atualizar a estrutura de dados para organizar os modelos por provedor
const MODEL_PROVIDERS = {
  openai: {
    name: "OpenAI",
    icon: "✨",
    models: [
      { id: "gpt-4.1-2025-04-14", name: "GPT-4.1" },
      { id: "gpt-4.1-mini-2025-04-14", name: "GPT-4.1 mini" },
      { id: "gpt-image-1", name: "GPT Image 1" },
      { id: "o4-mini-2025-04-16", name: "o4-mini" },
      { id: "o3-2025-04-16", name: "o3" },
      { id: "gpt-4o-2024-08-06", name: "GPT-4o" },
      { id: "gpt-4o-mini-2024-07-18", name: "GPT-4o mini" },
      { id: "gpt-3.5-turbo-0125", name: "GPT-3.5 Turbo" },
    ],
  },
  anthropic: {
    name: "Anthropic",
    icon: "🔮",
    models: [
      { id: "claude-3-7-sonnet-latest", name: "Claude 3.7 Sonnet" },
      { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet v2" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    ],
  },
  google: {
    name: "Google",
    icon: "🌐",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash lite" },
    ],
  },
  xai: {
    name: "xAI (Grok)",
    icon: "🚀",
    models: [
      { id: "grok-3", name: "Grok 3" },
      { id: "grok-3-mini", name: "Grok 3 mini" },
      { id: "grok-2", name: "Grok 2" },
    ],
  },
  mistral: {
    name: "Mistral AI",
    icon: "🌪️",
    models: [
      { id: "mistral-large", name: "Mistral Large" },
      { id: "mistral-small", name: "Mistral Small" },
      { id: "codestral", name: "Codestral" },
      { id: "mistral-saba", name: "Mistral Saba" },
    ],
  },
  deepseek: {
    name: "DeepSeek",
    icon: "🔍",
    models: [
      { id: "deepseek-chat", name: "DeepSeek-V3" },
      { id: "deepseek-reasoner", name: "DeepSeek-R1" },
    ],
  },
}

// Exemplos de prompts para inspirar os usuários
const PROMPT_EXAMPLES = [
  "Explique o conceito de aprendizado por reforço como se eu tivesse 10 anos.",
  "Escreva um e-mail profissional solicitando uma extensão de prazo para um projeto.",
  "Crie um plano de aula sobre mudanças climáticas para alunos do ensino médio.",
  "Descreva as principais diferenças entre REST e GraphQL.",
  "Escreva um poema sobre inteligência artificial no estilo de Carlos Drummond de Andrade.",
]

export default function LLMComparisonForm() {
  // Estados para controle do formulário
  const [prompt, setPrompt] = useState("")
  const [temperature, setTemperature] = useState(0.7)
  const [outputMode, setOutputMode] = useState<"text" | "code" | "image">("text")

  // Estados para controle dos modelos
  const [leftModel, setLeftModel] = useState({
    provider: "openai",
    modelId: "gpt-4.1-2025-04-14",
  })

  const [rightModel, setRightModel] = useState({
    provider: "anthropic",
    modelId: "claude-3-7-sonnet-latest",
  })

  // Estados para controle de UI
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ModelResponse[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [pinnedModels, setPinnedModels] = useState({ left: false, right: false })

  // Hooks
  const { toast } = useToast()

  // Resetar o estado de "salvo" quando uma nova comparação é feita
  useEffect(() => {
    if (results.length > 0) {
      setIsSaved(false)
    }
  }, [results])

  // Log de mudanças nos modelos para debug
  useEffect(() => {
    console.log("Estado atual dos modelos:")
    console.log("Modelo esquerdo:", leftModel)
    console.log("Modelo direito:", rightModel)
  }, [leftModel, rightModel])

  // Função para atualizar o provedor e selecionar o primeiro modelo
  const updateProvider = (side: "left" | "right", provider: string) => {
    // Verificar se o provedor existe em MODEL_PROVIDERS
    if (!MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS]) {
      console.error(`Provedor ${provider} não encontrado em MODEL_PROVIDERS`)
      return
    }

    const providerKey = provider as keyof typeof MODEL_PROVIDERS
    const firstModel = MODEL_PROVIDERS[providerKey].models[0]

    console.log(`Atualizando provedor ${side} para ${provider}, modelo: ${firstModel.id}`)

    if (side === "left") {
      setLeftModel({
        provider,
        modelId: firstModel.id,
      })
    } else {
      setRightModel({
        provider,
        modelId: firstModel.id,
      })
    }
  }

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      // Formatar os IDs dos modelos para incluir o provedor, apenas para modelos não travados
      const modelIds: string[] = []

      // Adicionar modelo da esquerda se não estiver travado
      if (!pinnedModels.left) {
        modelIds.push(`${leftModel.provider}/${leftModel.modelId}`)
      }

      // Adicionar modelo da direita se não estiver travado
      if (!pinnedModels.right) {
        modelIds.push(`${rightModel.provider}/${rightModel.modelId}`)
      }

      // Se nenhum modelo estiver selecionado, usar o modelo da esquerda por padrão
      if (modelIds.length === 0) {
        modelIds.push(`${leftModel.provider}/${leftModel.modelId}`)
      }

      console.log("Enviando requisição para modelos:", modelIds)
      console.log("Modo de saída:", outputMode)
      console.log("Temperatura:", temperature)

      const responses = await compareModels(prompt, modelIds, outputMode, { temperature })
      console.log("Respostas recebidas:", responses)

      // Verificar se alguma resposta contém erro
      const hasErrors = responses.some((response) => response.error)
      if (hasErrors) {
        console.warn(
          "Algumas respostas contêm erros:",
          responses.filter((r) => r.error),
        )
      }

      setResults(responses)
    } catch (error) {
      console.error("Erro ao comparar modelos:", error)
      toast({
        title: "Erro ao comparar modelos",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para salvar os resultados
  const handleSaveResults = () => {
    if (results.length === 0) return

    const resultsToSave = {
      prompt,
      temperature,
      timestamp: new Date().toISOString(),
      responses: results,
    }

    // Salvar no localStorage
    const savedComparisons = JSON.parse(localStorage.getItem("llm-comparisons") || "[]")
    localStorage.setItem("llm-comparisons", JSON.stringify([...savedComparisons, resultsToSave]))

    setIsSaved(true)
    toast({
      title: "Comparação salva",
      description: "A comparação foi salva com sucesso no seu histórico.",
    })
  }

  // Função para trocar os modelos
  const handleSwapModels = () => {
    setLeftModel(rightModel)
    setRightModel(leftModel)
  }

  // Função para usar um exemplo de prompt
  const handleUseExample = () => {
    const randomExample = PROMPT_EXAMPLES[Math.floor(Math.random() * PROMPT_EXAMPLES.length)]
    setPrompt(randomExample)
  }

  // Função para travar/destravar um modelo
  const togglePinModel = (side: "left" | "right") => {
    setPinnedModels((prev) => ({
      ...prev,
      [side]: !prev[side],
    }))
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Área de prompt e temperatura lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Área do prompt - ocupa 2/3 do espaço */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt" className="text-base font-medium">
                Seu Prompt
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleUseExample} className="text-xs h-8">
                Usar exemplo
              </Button>
            </div>
            <Textarea
              id="prompt"
              placeholder="Digite seu prompt aqui..."
              className="prompt-textarea min-h-[180px] resize-y font-medium text-base custom-scrollbar"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          {/* Controle de temperatura e modo de saída - ocupa 1/3 do espaço */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Temperatura: {temperature.toFixed(1)}</Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="mt-1.5"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mais preciso</span>
                  <span>Mais criativo</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Tipo de Saída</Label>
                <Tabs
                  defaultValue="text"
                  value={outputMode}
                  onValueChange={(value) => setOutputMode(value as "text" | "code" | "image")}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Texto</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-1">
                      <Code className="h-3.5 w-3.5" />
                      <span>Código</span>
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Imagem</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 come-button font-medium text-base mt-auto"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Comparando modelos...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Comparar Modelos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Seleção de modelos lado a lado */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Selecione os modelos para comparar</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modelo 1 */}
            <Card className={`model-card border-2 ${pinnedModels.left ? "border-primary bg-primary/5" : ""}`}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Modelo 1</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={pinnedModels.left ? "secondary" : "ghost"}
                          size="icon"
                          className={`h-8 w-8 ${pinnedModels.left ? "bg-primary/20 hover:bg-primary/30" : ""}`}
                          onClick={() => togglePinModel("left")}
                        >
                          {pinnedModels.left ? (
                            <Lock className="h-4 w-4 text-primary" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                          <span className="sr-only">{pinnedModels.left ? "Destravar modelo" : "Travar modelo"}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {pinnedModels.left
                            ? "Modelo travado (não será usado na comparação)"
                            : "Travar modelo (não será usado na comparação)"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="left-provider" className="text-xs">
                    Provedor
                  </Label>
                  <select
                    id="left-provider"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={leftModel.provider}
                    onChange={(e) => {
                      console.log(`Selecionando provedor esquerdo: ${e.target.value}`)
                      if (!pinnedModels.left) {
                        updateProvider("left", e.target.value)
                      }
                    }}
                    disabled={pinnedModels.left}
                  >
                    {Object.entries(MODEL_PROVIDERS).map(([providerId, provider]) => (
                      <option key={`left-${providerId}`} value={providerId}>
                        {provider.icon} {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="left-model" className="text-xs">
                    Modelo
                  </Label>
                  <select
                    id="left-model"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={leftModel.modelId}
                    onChange={(e) => {
                      console.log(`Selecionando modelo esquerdo: ${e.target.value}`)
                      if (!pinnedModels.left) {
                        setLeftModel({ ...leftModel, modelId: e.target.value })
                      }
                    }}
                    disabled={pinnedModels.left}
                  >
                    {MODEL_PROVIDERS[leftModel.provider as keyof typeof MODEL_PROVIDERS]?.models.map((model) => (
                      <option key={`left-model-${model.id}`} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Modelo 2 */}
            <Card className={`model-card border-2 ${pinnedModels.right ? "border-primary bg-primary/5" : ""}`}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-muted-foreground">Modelo 2</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={pinnedModels.right ? "secondary" : "ghost"}
                          size="icon"
                          className={`h-8 w-8 ${pinnedModels.right ? "bg-primary/20 hover:bg-primary/30" : ""}`}
                          onClick={() => togglePinModel("right")}
                        >
                          {pinnedModels.right ? (
                            <Lock className="h-4 w-4 text-primary" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                          <span className="sr-only">{pinnedModels.right ? "Destravar modelo" : "Travar modelo"}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {pinnedModels.right
                            ? "Modelo travado (não será usado na comparação)"
                            : "Travar modelo (não será usado na comparação)"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="right-provider" className="text-xs">
                    Provedor
                  </Label>
                  <select
                    id="right-provider"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={rightModel.provider}
                    onChange={(e) => {
                      console.log(`Selecionando provedor direito: ${e.target.value}`)
                      if (!pinnedModels.right) {
                        updateProvider("right", e.target.value)
                      }
                    }}
                    disabled={pinnedModels.right}
                  >
                    {Object.entries(MODEL_PROVIDERS).map(([providerId, provider]) => (
                      <option key={`right-${providerId}`} value={providerId}>
                        {provider.icon} {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="right-model" className="text-xs">
                    Modelo
                  </Label>
                  <select
                    id="right-model"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={rightModel.modelId}
                    onChange={(e) => {
                      console.log(`Selecionando modelo direito: ${e.target.value}`)
                      if (!pinnedModels.right) {
                        setRightModel({ ...rightModel, modelId: e.target.value })
                      }
                    }}
                    disabled={pinnedModels.right}
                  >
                    {MODEL_PROVIDERS[rightModel.provider as keyof typeof MODEL_PROVIDERS]?.models.map((model) => (
                      <option key={`right-model-${model.id}`} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de troca entre os modelos */}
          <div className="flex justify-center mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSwapModels}
                    className="swap-button rounded-full h-10 w-10"
                    disabled={pinnedModels.left && pinnedModels.right}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="sr-only">Trocar modelos</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Trocar posição dos modelos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Resultados da Comparação</h3>
            <Button variant="outline" size="sm" onClick={handleSaveResults} disabled={isSaved} className="gap-2">
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Comparação Salva
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar no Histórico
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((result, index) => {
              // Extrair provedor e modelId da string combinada
              const [provider, modelId] = result.modelId.split("/")

              return (
                <Card key={result.modelId} className="response-card overflow-hidden border-2">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">
                          {MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS]?.icon}
                        </span>
                        <div>
                          <h4 className="text-base font-medium">
                            {MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS]?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {
                              MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS]?.models.find(
                                (m) => m.id === modelId,
                              )?.name
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="mb-1">
                          {result.timeTaken}ms
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.tokensUsed ? `${result.tokensUsed} tokens` : "Tokens: N/A"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4 px-4 pb-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {result.error ? (
                      <p className="text-destructive whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {result.response}
                      </p>
                    ) : (
                      <ResponseViewer response={result} />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
