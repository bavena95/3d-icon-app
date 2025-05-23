"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import UserCredits from "@/components/dashboard/user-credits"
import UserIcons from "@/components/dashboard/user-icons"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) {
    return null // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.user_metadata?.name || "User"}</p>
          </div>

          <Button asChild className="bg-black text-white hover:bg-gray-800 rounded-full">
            <Link href="/create">Create New Icon</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <UserCredits userId={user.id} />
          </div>

          <div className="md:col-span-2">
            <UserIcons userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
