"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Check, Key, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface ModelConfigDialogProps {
  onSaveConfig?: () => void
}

export default function ModelConfigDialog({ onSaveConfig }: ModelConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<Record<string, string>>({
    OPENAI_API_KEY: "",
    ANTHROPIC_API_KEY: "",
    GOOGLE_API_KEY: "",
    XAI_API_KEY: "",
    MISTRAL_API_KEY: "",
    MARITACA_API_KEY: "",
    DEEPSEEK_API_KEY: "",
  })
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error" | "loading">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  // Carregar configurações atuais do backend quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      fetchCurrentConfig()
    }
  }, [open])

  // Função para buscar a configuração atual do backend
  const fetchCurrentConfig = async () => {
    try {
      setSaveStatus("loading")
      const response = await fetch("/api/config/keys")

      if (!response.ok) {
        throw new Error("Falha ao carregar configurações")
      }

      const data = await response.json()

      // Preencher apenas os nomes das chaves que existem, não os valores reais
      // por questões de segurança
      const configWithMaskedValues: Record<string, string> = {}

      Object.keys(data.keys).forEach((key) => {
        if (data.keys[key]) {
          configWithMaskedValues[key] = "••••••••••••••••" // Valor mascarado
        } else {
          configWithMaskedValues[key] = ""
        }
      })

      setConfig(configWithMaskedValues)
      setSaveStatus("idle")
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      setSaveStatus("error")
      setErrorMessage("Não foi possível carregar as configurações atuais.")
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações atuais.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    try {
      setSaveStatus("loading")

      // Filtrar apenas as chaves que foram alteradas (não estão mascaradas)
      const keysToUpdate: Record<string, string> = {}
      Object.keys(config).forEach((key) => {
        if (config[key] && !config[key].includes("••••")) {
          keysToUpdate[key] = config[key]
        }
      })

      const response = await fetch("/api/config/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keys: keysToUpdate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Falha ao salvar configurações")
      }

      setSaveStatus("success")

      // Chamar callback se fornecido
      if (onSaveConfig) {
        onSaveConfig()
      }

      toast({
        title: "Sucesso",
        description: "Chaves de API salvas com sucesso no servidor.",
      })

      // Resetar status após 2 segundos
      setTimeout(() => {
        setSaveStatus("idle")
        setOpen(false)
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      setSaveStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Erro desconhecido")
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Key className="h-4 w-4" />
          Configurar Chaves de API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configuração de Chaves de API</DialogTitle>
          <DialogDescription>
            Configure suas chaves de API para os diferentes provedores de LLM. As chaves serão salvas de forma segura no
            servidor.
          </DialogDescription>
        </DialogHeader>

        {saveStatus === "loading" && (
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-600 dark:text-blue-400 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Carregando configurações...
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="openai">OpenAI & Anthropic</TabsTrigger>
            <TabsTrigger value="google">Google & xAI</TabsTrigger>
            <TabsTrigger value="others">Mistral & Outros</TabsTrigger>
          </TabsList>

          <TabsContent value="openai" className="space-y-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="openai" className="text-right col-span-1">
                OpenAI
              </Label>
              <Input
                id="openai"
                type="password"
                placeholder="sk-..."
                className="col-span-4"
                value={config.OPENAI_API_KEY}
                onChange={(e) => handleChange("OPENAI_API_KEY", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="anthropic" className="text-right col-span-1">
                Anthropic
              </Label>
              <Input
                id="anthropic"
                type="password"
                placeholder="sk-ant-..."
                className="col-span-4"
                value={config.ANTHROPIC_API_KEY}
                onChange={(e) => handleChange("ANTHROPIC_API_KEY", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="google" className="text-right col-span-1">
                Google
              </Label>
              <Input
                id="google"
                type="password"
                placeholder="AIza..."
                className="col-span-4"
                value={config.GOOGLE_API_KEY}
                onChange={(e) => handleChange("GOOGLE_API_KEY", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="xai" className="text-right col-span-1">
                xAI (Grok)
              </Label>
              <Input
                id="xai"
                type="password"
                placeholder="xai-..."
                className="col-span-4"
                value={config.XAI_API_KEY}
                onChange={(e) => handleChange("XAI_API_KEY", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="others" className="space-y-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="mistral" className="text-right col-span-1">
                Mistral AI
              </Label>
              <Input
                id="mistral"
                type="password"
                placeholder="..."
                className="col-span-4"
                value={config.MISTRAL_API_KEY}
                onChange={(e) => handleChange("MISTRAL_API_KEY", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="deepseek" className="text-right col-span-1">
                DeepSeek
              </Label>
              <Input
                id="deepseek"
                type="password"
                placeholder="..."
                className="col-span-4"
                value={config.DEEPSEEK_API_KEY}
                onChange={(e) => handleChange("DEEPSEEK_API_KEY", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="maritaca" className="text-right col-span-1">
                Maritaca AI
              </Label>
              <Input
                id="maritaca"
                type="password"
                placeholder="..."
                className="col-span-4"
                value={config.MARITACA_API_KEY}
                onChange={(e) => handleChange("MARITACA_API_KEY", e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            As chaves serão salvas no arquivo .env do servidor. Certifique-se de que o servidor tenha permissões de
            escrita.
          </AlertDescription>
        </Alert>

        {saveStatus === "success" && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Configurações salvas com sucesso no servidor!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-600 dark:text-red-400">
              {errorMessage || "Erro ao salvar configurações. Tente novamente."}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSave} className="gap-2" disabled={saveStatus === "loading"}>
            {saveStatus === "loading" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                Salvar configurações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
