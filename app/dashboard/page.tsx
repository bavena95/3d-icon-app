import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import UserCredits from "@/components/dashboard/user-credits"
import UserIcons from "@/components/dashboard/user-icons"

export default async function DashboardPage() {
  // Verificação de autenticação na própria página
  const user = await currentUser()

  if (!user) {
    return redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.firstName || "User"}</p>
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
