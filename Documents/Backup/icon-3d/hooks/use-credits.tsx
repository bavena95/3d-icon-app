"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"

interface CreditsContextType {
  credits: number
  isLoading: boolean
  addCredits: (amount: number, price: number) => Promise<void>
  decrementCredits: () => void
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Carregar créditos do usuário do banco de dados
  const fetchCredits = async () => {
    if (!user) {
      setCredits(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("users").select("credits").eq("id", user.id).single()

      if (error) {
        console.error("Erro ao carregar créditos:", error)
        return
      }

      setCredits(data.credits)
    } catch (error) {
      console.error("Erro ao carregar créditos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar créditos quando o usuário fizer login
  useEffect(() => {
    if (!isAuthLoading) {
      fetchCredits()
    }
  }, [isAuthLoading, user?.id])

  // Adicionar créditos ao usuário
  const addCredits = async (amount: number, price: number) => {
    if (!user) return

    try {
      // Registrar a compra
      const purchaseId = crypto.randomUUID()

      await supabase.from("purchases").insert({
        id: purchaseId,
        amount: price,
        credits: amount,
        status: "completed",
        provider: "manual",
        user_id: user.id,
      })

      // Obter créditos atuais
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single()

      if (userError) {
        throw userError
      }

      // Atualizar créditos
      const { data, error } = await supabase
        .from("users")
        .update({
          credits: userData.credits + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCredits(data.credits)
    } catch (error) {
      console.error("Erro ao adicionar créditos:", error)
      throw error
    }
  }

  // Decrementar créditos do usuário (versão simplificada)
  const decrementCredits = () => {
    if (user && credits > 0) {
      setCredits((prev) => Math.max(0, prev - 1))
    }
  }

  // Atualizar créditos do usuário
  const refreshCredits = async () => {
    return fetchCredits()
  }

  return (
    <CreditsContext.Provider value={{ credits, isLoading, addCredits, decrementCredits, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider")
  }
  return context
}
