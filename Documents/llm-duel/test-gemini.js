// Arquivo para testar a API do @google/genai versão 0.12.0
const fs = require("fs")

async function testGemini() {
  try {
    console.log("Testando a API do Google Gemini...")

    // Importar o módulo
    const { GoogleGenerativeAI } = await import("@google/genai")

    // Verificar se a chave de API está configurada
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error("Erro: GOOGLE_API_KEY não está configurada.")
      console.log("Configure a variável de ambiente GOOGLE_API_KEY e tente novamente.")
      return
    }

    // Inicializar o cliente
    const genAI = new GoogleGenerativeAI(apiKey)

    // Verificar os métodos disponíveis
    console.log("Métodos disponíveis em genAI:", Object.keys(genAI))

    // Verificar se generativeModel está disponível
    if (typeof genAI.generativeModel === "function") {
      console.log("generativeModel é uma função")

      // Criar um modelo
      const model = genAI.generativeModel({ model: "gemini-1.5-pro" })

      // Verificar os métodos disponíveis no modelo
      console.log("Métodos disponíveis no modelo:", Object.keys(model))

      // Gerar conteúdo
      console.log("Gerando conteúdo...")
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Olá, como você está?" }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      })

      // Exibir a resposta
      console.log("Resposta:", result.response.text())

      // Salvar informações em um arquivo para referência
      fs.writeFileSync(
        "gemini-test-result.json",
        JSON.stringify(
          {
            success: true,
            methods: {
              genAI: Object.keys(genAI),
              model: Object.keys(model),
            },
            response: result.response.text(),
          },
          null,
          2,
        ),
      )

      console.log("Teste concluído com sucesso! Resultados salvos em gemini-test-result.json")
    } else {
      console.log("generativeModel NÃO é uma função")
      console.log("API disponível:", Object.keys(genAI))

      // Salvar informações em um arquivo para referência
      fs.writeFileSync(
        "gemini-test-result.json",
        JSON.stringify(
          {
            success: false,
            methods: {
              genAI: Object.keys(genAI),
            },
            error: "generativeModel não é uma função",
          },
          null,
          2,
        ),
      )

      console.log("Teste concluído com falha. Resultados salvos em gemini-test-result.json")
    }
  } catch (error) {
    console.error("Erro ao testar a API do Google Gemini:", error)

    // Salvar informações em um arquivo para referência
    fs.writeFileSync(
      "gemini-test-result.json",
      JSON.stringify(
        {
          success: false,
          error: error.message,
          stack: error.stack,
        },
        null,
        2,
      ),
    )

    console.log("Teste concluído com erro. Resultados salvos em gemini-test-result.json")
  }
}

// Executar o teste
testGemini()
