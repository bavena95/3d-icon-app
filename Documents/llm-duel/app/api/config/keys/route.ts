import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Função para ler as chaves de API do arquivo .env
function readApiKeys() {
  try {
    // Carregar o arquivo .env
    const envPath = path.resolve(process.cwd(), ".env.local")

    // Verificar se o arquivo existe
    if (!fs.existsSync(envPath)) {
      return { keys: {}, error: "Arquivo .env.local não encontrado" }
    }

    // Ler e analisar o arquivo .env
    const envContent = fs.readFileSync(envPath, "utf8")
    const envConfig = dotenv.parse(envContent)

    // Filtrar apenas as chaves de API
    const apiKeys = [
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY",
      "GOOGLE_API_KEY",
      "XAI_API_KEY",
      "MISTRAL_API_KEY",
      "MARITACA_API_KEY",
      "DEEPSEEK_API_KEY",
    ]

    const keys: Record<string, boolean> = {}

    apiKeys.forEach((key) => {
      // Armazenamos apenas se a chave existe, não o valor real
      keys[key] = !!envConfig[key]
    })

    return { keys, error: null }
  } catch (error) {
    console.error("Erro ao ler chaves de API:", error)
    return {
      keys: {},
      error: error instanceof Error ? error.message : "Erro desconhecido ao ler chaves de API",
    }
  }
}

// Função para salvar as chaves de API no arquivo .env
async function saveApiKeys(newKeys: Record<string, string>) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local")

    // Ler o arquivo .env existente ou criar um novo
    let envContent = ""
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8")
    }

    // Analisar o conteúdo existente
    const envConfig = dotenv.parse(envContent)

    // Atualizar com as novas chaves
    Object.keys(newKeys).forEach((key) => {
      if (newKeys[key]) {
        envConfig[key] = newKeys[key]
      }
    })

    // Converter de volta para o formato .env
    const newEnvContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    // Salvar o arquivo
    fs.writeFileSync(envPath, newEnvContent)

    return { success: true, error: null }
  } catch (error) {
    console.error("Erro ao salvar chaves de API:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao salvar chaves de API",
    }
  }
}

// Endpoint GET para obter as chaves de API configuradas
export async function GET(request: NextRequest) {
  try {
    const { keys, error } = readApiKeys()

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ keys })
  } catch (error) {
    console.error("Erro no endpoint GET /api/config/keys:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 },
    )
  }
}

// Endpoint POST para salvar novas chaves de API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.keys || typeof body.keys !== "object") {
      return NextResponse.json({ error: "Formato de requisição inválido" }, { status: 400 })
    }

    const { success, error } = await saveApiKeys(body.keys)

    if (!success) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // Recarregar as variáveis de ambiente
    Object.keys(body.keys).forEach((key) => {
      if (body.keys[key]) {
        process.env[key] = body.keys[key]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no endpoint POST /api/config/keys:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
