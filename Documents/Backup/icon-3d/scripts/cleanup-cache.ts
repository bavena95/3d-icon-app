import { cleanupCache } from "../lib/cache"

async function main() {
  try {
    const days = process.argv[2] ? Number.parseInt(process.argv[2], 10) : 30
    console.log(`Limpando itens do cache mais antigos que ${days} dias...`)

    const deletedCount = await cleanupCache(days)
    console.log(`${deletedCount} itens removidos do cache.`)

    process.exit(0)
  } catch (error) {
    console.error("Erro ao limpar cache:", error)
    process.exit(1)
  }
}

main()
