"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { SavedComparison } from "@/lib/types"
import ResponseViewer from "@/components/response-viewer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SavedComparisonPage() {
  const params = useParams()
  const router = useRouter()
  const [comparison, setComparison] = useState<SavedComparison | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const timestamp = params.timestamp as string

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedComparisons = JSON.parse(localStorage.getItem("llm-comparisons") || "[]") as SavedComparison[]
      const foundComparison = savedComparisons.find((comp) => comp.timestamp === timestamp)

      if (foundComparison) {
        setComparison(foundComparison)
      } else {
        // Comparação não encontrada, redirecionar para a página de histórico
        router.push("/history")
      }
    }
  }, [timestamp, router])

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (typeof window !== "undefined") {
      const savedComparisons = JSON.parse(localStorage.getItem("llm-comparisons") || "[]") as SavedComparison[]
      const updatedComparisons = savedComparisons.filter((comp) => comp.timestamp !== timestamp)
      localStorage.setItem("llm-comparisons", JSON.stringify(updatedComparisons))
      setDeleteDialogOpen(false)
      router.push("/history")
    }
  }

  const handleBack = () => {
    router.push("/history")
  }

  if (!comparison) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-[50vh]">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
            <h1 className="text-2xl font-bold">Detalhes da Comparação</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Prompt</h2>
                <p className="text-muted-foreground text-sm">
                  Temperatura: {comparison.temperature} • Salvo em: {new Date(comparison.timestamp).toLocaleString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="whitespace-pre-wrap">{comparison.prompt}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comparison.responses.map((response) => {
            const [provider, modelId] = response.modelId.split("/")

            return (
              <Card key={response.modelId} className="overflow-hidden border-2">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium">{provider}</h3>
                      <p className="text-sm text-muted-foreground">{modelId}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="mb-1">
                        {response.timeTaken}ms
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {response.tokensUsed ? `${response.tokensUsed} tokens` : "Tokens: N/A"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 px-4 pb-2">
                  {response.error ? (
                    <p className="text-destructive whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {response.response}
                    </p>
                  ) : (
                    <ResponseViewer response={response} />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comparação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta comparação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
