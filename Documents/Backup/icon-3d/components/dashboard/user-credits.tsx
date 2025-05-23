"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Plus, RefreshCw } from "lucide-react"
import { useCredits } from "@/hooks/use-credits"
import PurchaseCreditsModal from "@/components/purchase-credits-modal"
import { useAuth } from "@/contexts/auth-context"

export default function UserCredits() {
  const { user } = useAuth()
  const userId = user?.id
  const { credits, isLoading, refreshCredits } = useCredits()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(false)
    try {
      await refreshCredits()
    } catch (e) {
      console.error("Erro ao atualizar créditos:", e)
      setError(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Credits</CardTitle>
              <CardDescription>Manage your credits to create icons</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Coins className="h-8 w-8 text-amber-500" />
              </div>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 bg-gray-200 animate-pulse rounded"></span>
                ) : error ? (
                  <span className="text-gray-400">--</span>
                ) : (
                  credits
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">{error ? "Unable to load credits" : "available credits"}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setShowPurchaseModal(true)} className="w-full bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Buy Credits
          </Button>
        </CardFooter>
      </Card>

      <PurchaseCreditsModal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
    </>
  )
}
