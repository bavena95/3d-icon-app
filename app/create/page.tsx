import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import IconGenerator from "@/components/icon-generator"

export default async function CreatePage() {
  // Verificação de autenticação na própria página
  const user = await currentUser()

  if (!user) {
    return redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Create Your 3D Icon</h1>
          <p className="text-gray-600 mb-8">Describe the icon you imagine and our AI will make it happen.</p>

          <IconGenerator />
        </div>
      </main>
    </div>
  )
}
