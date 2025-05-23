"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import type { Icon } from "@/types/icon" // Import Icon type

export default function UserIcons() {
  const { user } = useAuth()
  const userId = user?.id

  const [icons, setIcons] = useState<Icon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIcons = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/icons")

      if (!response.ok) {
        throw new Error("Falha ao carregar ícones")
      }

      const data = await response.json()
      setIcons(data.icons || [])
    } catch (error) {
      console.error("Erro ao carregar ícones:", error)
      setError("Não foi possível carregar seus ícones. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIcons()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Seus Ícones</CardTitle>
            <CardDescription>Gerencie os ícones que você criou</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchIcons} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">Carregando seus ícones...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Button className="mt-4" variant="outline" onClick={fetchIcons}>
                  Tentar novamente
                </Button>
              </div>
            ) : icons.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {icons.map((icon) => (
                  <div key={icon.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={icon.staticUrl || "/placeholder.svg"}
                        alt={icon.prompt}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium truncate" title={icon.prompt}>
                        {icon.prompt}
                      </h3>
                      <p className="text-xs text-gray-500">{new Date(icon.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white"
                          onClick={() => {
                            const a = document.createElement("a")
                            a.href = icon.staticUrl
                            a.download = `icon-${icon.id}.png`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {icon.animatedUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            onClick={() => {
                              const a = document.createElement("a")
                              a.href = icon.animatedUrl!
                              a.download = `icon-animated-${icon.id}.mp4`
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Você ainda não criou nenhum ícone.</p>
                <Button className="mt-4 bg-black text-white hover:bg-gray-800" asChild>
                  <Link href="/create">Criar Meu Primeiro Ícone</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="text-center py-12">
              <p className="text-gray-500">Exibindo seus ícones mais recentes.</p>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="text-center py-12">
              <p className="text-gray-500">Exibindo seus ícones favoritos.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
