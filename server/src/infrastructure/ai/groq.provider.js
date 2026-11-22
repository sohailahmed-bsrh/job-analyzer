import Groq from 'groq-sdk'
import { env } from '../../config/env.js'

export class GroqProvider {
  constructor(apiKey = env.GROQ_API_KEY, modelId = env.GROQ_MODEL) {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  get client() {
    if (!this._client) {
      if (!this.apiKey) {
        const error = new Error('Groq API Key is not configured for this provider.');
        error.code = 'AUTH_ERROR';
        throw error;
      }
      this._client = new Groq({ apiKey: this.apiKey });
    }
    return this._client;
  }

  async generateStructured({ systemInstruction, contents, responseSchema, tools = [] }) {
    const messages = []
    
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction })
    }

    if (typeof contents === 'string') {
      messages.push({ role: 'user', content: contents })
    } else if (Array.isArray(contents)) {
      for (const msg of contents) {
        const textParts = msg.parts.map(p => p.text).join('\n')
        messages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: textParts })
      }
    }

    let schemaPrompt = ''
    if (responseSchema) {
      schemaPrompt = `\n\nYou MUST return ONLY valid JSON enclosed in \`\`\`json and \`\`\` tags. The JSON must strictly adhere to this JSON Schema:\n${JSON.stringify(responseSchema)}`
      if (messages[0] && messages[0].role === 'system') {
        messages[0].content += schemaPrompt
      } else {
        messages.unshift({ role: 'system', content: `You are an AI assistant.${schemaPrompt}` })
      }
    }

    const options = {
      model: this.modelId,
      messages,
      temperature: 0.1,
      max_tokens: 4000
    }

    if (responseSchema) {
      options.response_format = { type: 'json_object' }
    }

    const response = await this.client.chat.completions.create(options)

    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('Groq returned an empty response.')
    }
    
    let content = response.choices[0].message.content
    
    // Remove <think> blocks which might contain mock/partial JSON
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '')
    
    // Extract JSON from markdown tags if present
    if (responseSchema) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (match) {
        content = match[1]
      } else {
        // Fallback: try to find the first '{' and last '}'
        const firstBrace = content.indexOf('{')
        const lastBrace = content.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1) {
          content = content.substring(firstBrace, lastBrace + 1)
        }
      }
    }
    return content
  }

  async generateText({ systemInstruction, contents }) {
    const messages = []
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction })
    }
    if (typeof contents === 'string') {
      messages.push({ role: 'user', content: contents })
    } else if (Array.isArray(contents)) {
      for (const msg of contents) {
        const textParts = msg.parts.map(p => p.text).join('\n')
        messages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: textParts })
      }
    }

    const response = await this.client.chat.completions.create({
      model: this.modelId,
      messages,
      max_tokens: 4000
    })

    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('Groq returned an empty response.')
    }

    return response.choices[0].message.content
  }
}

export const groq = new GroqProvider()
export const groqCV = new GroqProvider(env.GROQ_CV_API_KEY, env.GROQ_CV_MODEL)
