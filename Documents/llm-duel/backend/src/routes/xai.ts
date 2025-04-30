import express from "express"
import { XAIService } from "../services/xai"
import { ApiError } from "../middleware/errorHandler"
import type { LLMRequestBody } from "../types"

const router = express.Router()
const xaiService = new XAIService()

router.post("/", async (req, res, next) => {
  try {
    const { prompt, mode, options } = req.body as LLMRequestBody

    if (!prompt) {
      throw ApiError.badRequest("Prompt é obrigatório")
    }

    if (!mode || !["text", "code", "image"].includes(mode)) {
      throw ApiError.badRequest('Modo inválido. Deve ser "text", "code" ou "image"')
    }

    const startTime = Date.now()
    const result = await xaiService.generateResponse(prompt, mode, options)
    const timeTaken = Date.now() - startTime

    res.json({
      ...result,
      timeTaken,
    })
  } catch (error) {
    next(error)
  }
})

export default router
