import { Router } from 'express'
import { env } from '../../config/env.js'
import { aiService } from '../../infrastructure/ai/ai.service.js'

export const aiTestRouter = Router()

aiTestRouter.get('/health', async (req, res, next) => {
  try {
    const response = await aiService.generateText({
      systemInstruction: 'You are a testing bot.',
      contents: 'Say the word "OK" and nothing else.'
    })
    
    if (response.success) {
      res.json({
        success: true,
        service: 'resume-cover-letter-maker',
        provider: response.provider,
        configuredPrimary: env.AI_PROVIDER,
        configuredFallback: env.AI_FALLBACK_PROVIDER,
        message: 'AI Provider is healthy',
        aiOutput: response.data
      })
    } else {
      res.status(503).json({
        success: false,
        error: response.error,
        provider: response.provider,
        configuredPrimary: env.AI_PROVIDER
      })
    }
  } catch (err) {
    next(err)
  }
})
