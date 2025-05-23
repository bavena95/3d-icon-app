import OpenAI from "openai"

// Inicializar o cliente OpenAI com a chave da API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai
