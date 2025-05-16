"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"

interface CreditsContextType {
  credits: number
  isLoading: boolean
  addCredits: (amount: number, price: number) => Promise<void>
  decrementCredits: () => void
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, user } = useUser()
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar créditos do usuário do banco de dados
  const fetchCredits = async () => {
    if (!isSignedIn) {
      setCredits(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/credits")

      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits)
      }
    } catch (error) {
      console.error("Erro ao carregar créditos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar créditos quando o usuário fizer login
  useEffect(() => {
    fetchCredits()
  }, [isSignedIn, user?.id])

  // Adicionar créditos ao usuário
  const addCredits = async (amount: number, price: number) => {
    if (!isSignedIn) return

    try {
      const response = await fetch("/api/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price,
          credits: amount,
          provider: "manual",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits)
      }
    } catch (error) {
      console.error("Erro ao adicionar créditos:", error)
      throw error
    }
  }

  // Decrementar créditos do usuário (versão simplificada)
  const decrementCredits = () => {
    if (isSignedIn && credits > 0) {
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
