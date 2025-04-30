"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Trash2, Eye } from "lucide-react"
import type { SavedComparison } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { useRouter } from "next/navigation"

export default function HistoryList() {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedComparisons = JSON.parse(localStorage.getItem("llm-comparisons") || "[]")
      setComparisons(savedComparisons)
    }
  }, [])

  const handleDelete = (timestamp: string) => {
    setItemToDelete(timestamp)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    const updatedComparisons = comparisons.filter((comp) => comp.timestamp !== itemToDelete)
    setComparisons(updatedComparisons)
    localStorage.setItem("llm-comparisons", JSON.stringify(updatedComparisons))
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleViewDetails = (timestamp: string) => {
    router.push(`/history/${timestamp}`)
  }

  if (comparisons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted rounded-full p-3 mb-4">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Nenhuma comparação salva</h3>
        <p className="text-muted-foreground max-w-md">
          Você ainda não tem comparações salvas. Compare alguns modelos e salve os resultados para vê-los aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Histórico de Comparações</h2>
      <p className="text-muted-foreground mb-6">
        Aqui você pode visualizar e gerenciar suas comparações salvas anteriormente.
      </p>

      {comparisons.map((comparison) => (
        <Card key={comparison.timestamp} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base truncate max-w-[500px]">{comparison.prompt}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(comparison.timestamp), { addSuffix: true, locale: ptBR })}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(comparison.timestamp)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {comparison.responses.map((response) => {
                  const [provider, modelId] = response.modelId.split("/")
                  return (
                    <Badge key={response.modelId} variant="secondary" className="px-2 py-1">
                      {provider}/{modelId}
                    </Badge>
                  )
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Tempo médio:{" "}
                  {Math.round(
                    comparison.responses.reduce((acc, r) => acc + r.timeTaken, 0) / comparison.responses.length,
                  )}
                  ms
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-4 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Temperatura: {comparison.temperature}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleViewDetails(comparison.timestamp)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Ver detalhes</span>
            </Button>
          </CardFooter>
        </Card>
      ))}

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
