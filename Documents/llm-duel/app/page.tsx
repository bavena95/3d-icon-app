import { Suspense } from "react"
import LLMComparisonForm from "@/components/llm-comparison-form"
import ModelConfigDialog from "@/components/model-config-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { Github, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium tracking-tight">LLM Duel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/history">Histórico</Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://github.com/bavena95/llm-duel" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 container">
        <div className="max-w-[800px] mx-auto mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Comparador de Modelos</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Compare diferentes modelos de linguagem lado a lado para encontrar o melhor para seu caso de uso.
          </p>

          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Importante: Configure suas chaves de API abaixo. As chaves serão salvas de forma segura no servidor.
            </AlertDescription>
          </Alert>

          <div className="flex">
            <ModelConfigDialog />
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto">
          <Suspense fallback={<div className="flex justify-center py-20">Carregando...</div>}>
            <LLMComparisonForm />
          </Suspense>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LLM Duel. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
