import { env } from '../../config/env.js'
import { gemini } from './gemini.provider.js'
import { groq, groqCV } from './groq.provider.js'
import { parseAiResponse } from '../../utils/jsonParser.js'

const providers = { gemini, groq, groqCV }

const MAX_RETRIES = 3
const BASE_DELAY = 1000 // 1 second

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isTemporaryError(error, providerName) {
  if (error.code === 'JSON_PARSE_ERROR' || error.name === 'ZodError') return true
  
  const msg = (error.message || '').toLowerCase()
  if (providerName === 'gemini') {
    if (msg.includes('503') || msg.includes('unavailable') || msg.includes('timeout') || msg.includes('network') || msg.includes('fetch failed')) return true
  } else if (providerName === 'groq') {
    if (msg.includes('503') || msg.includes('timeout') || msg.includes('network') || msg.includes('fetch failed')) return true
  }
  return false
}

function isQuotaError(error, providerName) {
  const msg = (error.message || '').toLowerCase()
  if (providerName === 'gemini') {
    if (msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) return true
  } else if (providerName === 'groq') {
    if (msg.includes('429') || msg.includes('quota')) return true
  }
  return false
}

function isAuthError(error, providerName) {
  const msg = (error.message || '').toLowerCase()
  return msg.includes('401') || msg.includes('api key') || msg.includes('authentication')
}

export class AIService {
  
  async executeWithRetryAndFallback(operationName, params, isText = false, options = {}) {
    let currentProvider = options.primaryProvider !== undefined ? options.primaryProvider : env.AI_PROVIDER
    let fallbackProvider = options.fallbackProvider !== undefined ? options.fallbackProvider : env.AI_FALLBACK_PROVIDER

    let lastError = null
    const attemptedProviders = new Set()

    for (const providerName of [currentProvider, fallbackProvider]) {
      if (!providerName || !providers[providerName]) continue
      if (attemptedProviders.has(providerName)) continue
      attemptedProviders.add(providerName)
      
      const provider = providers[providerName]
      
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (!isText && attempt > 1) {
            // Remind model if retrying due to structure failure
            params.systemInstruction = (params.systemInstruction || '') + '\nIMPORTANT: Return ONLY valid structured JSON matching the schema. Do not include markdown, explanations, or any extra text.'
          }

          let data = isText 
            ? await provider.generateText(params) 
            : await provider.generateStructured(params)
          
          if (!isText) {
            data = parseAiResponse(data)
            if (params.zodSchema) {
              data = params.zodSchema.parse(data)
            }
          }
          
          return { success: true, data, provider: providerName }
        } catch (error) {
          lastError = error
          const msg = (error.message || '').toLowerCase()
          console.error(`[AIService] Error from provider ${providerName} (Attempt ${attempt}/${MAX_RETRIES}):`, error.message)
          
          if (error.code === 'JSON_PARSE_ERROR' || error.name === 'ZodError') {
            console.error(`[AIService] AI Structure Failure.`)
            if (error.rawOutput) {
               console.error(`--- RAW OUTPUT PREVIEW ---`)
               console.error(error.rawOutput.substring(0, 500))
               if (error.rawOutput.length > 500) {
                 console.error(`... [${error.rawOutput.length - 1000} bytes omitted] ...`)
                 console.error(error.rawOutput.substring(error.rawOutput.length - 500))
               }
               console.error(`--------------------------`)
            }
          }
          
          if (isAuthError(error, providerName)) {
            return { success: false, error: { code: 'AUTH_ERROR', message: `Invalid configuration for AI service.` }, provider: providerName }
          }
          
          if (msg.includes('404') && msg.includes('model')) {
            return { success: false, error: { code: 'MODEL_NOT_FOUND', message: `Model configuration error for AI service.` }, provider: providerName }
          }
          
          if (msg.includes('400') || msg.includes('invalid_argument')) {
            return { success: false, error: { code: 'INVALID_REQUEST', message: `Invalid request payload sent to AI service.` }, provider: providerName }
          }

          if (isQuotaError(error, providerName)) {
            // Exhausted daily quota or hard limit. Do not retry, cascade to fallback.
            break 
          }

          if (isTemporaryError(error, providerName)) {
            if (attempt < MAX_RETRIES) {
              const delay = BASE_DELAY * Math.pow(2, attempt - 1) + Math.random() * 500
              await wait(delay)
              continue 
            } else {
              break 
            }
          }
          
          // Unknown error, cascade to fallback
          break
        }
      }
    }
    
    console.error(`[AIService] Exhausted all providers. Last error:`, lastError)
    return { success: false, error: { code: 'UNAVAILABLE', message: 'AI service is temporarily unavailable. Please try again shortly.' }, provider: 'unknown' }
  }

  async generateStructured(params, options = {}) {
    return this.executeWithRetryAndFallback('generateStructured', params, false, options)
  }

  async generateText(params, options = {}) {
    return this.executeWithRetryAndFallback('generateText', params, true, options)
  }
}

export const aiService = new AIService()
