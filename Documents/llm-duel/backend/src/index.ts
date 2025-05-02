import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"

// Rotas
import openaiRouter from "./routes/openai"
import claudeRouter from "./routes/claude"
import geminiRouter from "./routes/gemini"
import xaiRouter from "./routes/xai"
import deepseekRouter from "./routes/deepseek"
import mistralRouter from "./routes/mistral"
import maritacaRouter from "./routes/maritaca"

// Middleware
import { errorHandler } from "./middleware/errorHandler"

// Carregar variáveis de ambiente
// dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001


// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet()) // Segurança
app.use(cors()) // Permitir CORS
app.use(express.json()) // Parsing de JSON
app.use(morgan("dev")) // Logging
app.use(limiter) // Rate limiting

// Rotas
app.use("/api/openai", openaiRouter)
app.use("/api/anthropic", claudeRouter)
app.use("/api/google", geminiRouter)
app.use("/api/xai", xaiRouter)
app.use("/api/deepseek", deepseekRouter)
app.use("/api/mistral", mistralRouter)
app.use("/api/maritaca", maritacaRouter)

// Rota de verificação de saúde
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
})

// Middleware de tratamento de erro
app.use(errorHandler)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

export default app
