import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(5186),
  WEB_ORIGIN: z.string().url().default('http://localhost:5185'),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-3.1-pro-preview'),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('qwen/qwen3.6-27b'),
  GROQ_CV_API_KEY: z.string().optional(),
  GROQ_CV_MODEL: z.string().default('openai/gpt-oss-120b'),
  AI_PROVIDER: z.enum(['gemini', 'groq']).default('gemini'),
  AI_FALLBACK_PROVIDER: z.enum(['gemini', 'groq']).optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  MAX_UPLOAD_MB: z.coerce.number().default(8),
  UPLOAD_DIR: z.string().default('./storage/uploads'),
  GOOGLE_CLIENT_ID: z.string().optional(),
})

export const env = schema.parse(process.env)
