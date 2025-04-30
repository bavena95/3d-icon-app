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
import { Settings, Check, Key } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModelConfigDialogProps {
  onSaveConfig?: (config: Record<string, string>) => void
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
  })
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  // Carregar configurações salvas quando o componente montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedConfig = localStorage.getItem("llm-api-keys")
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig))
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }
  }, [])

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaveStatus("idle")
  }

  const handleSave = () => {
    try {
      // Salvar no localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("llm-api-keys", JSON.stringify(config))
      }

      // Chamar callback se fornecido
      if (onSaveConfig) {
        onSaveConfig(config)
      }

      setSaveStatus("success")

      // Resetar status após 3 segundos
      setTimeout(() => {
        setSaveStatus("idle")
        setOpen(false)
      }, 1500)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      setSaveStatus("error")
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
            Configure suas chaves de API para os diferentes provedores de LLM. Estas chaves são armazenadas apenas no
            seu navegador e nunca são enviadas para nossos servidores.
          </DialogDescription>
        </DialogHeader>

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

        {saveStatus === "success" && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-600 dark:text-red-400">
              Erro ao salvar configurações. Tente novamente.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSave} className="gap-2">
            <Settings className="h-4 w-4" />
            Salvar configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
