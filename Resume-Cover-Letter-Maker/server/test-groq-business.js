import 'dotenv/config'
import { aiService } from './src/infrastructure/ai/ai.service.js'
import { jobAnalysisResponseSchema } from './src/modules/jobs/job.analysis.schemas.js'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('Testing job analysis via Groq...')
  try {
    const aiResponse = await aiService.generateStructured({
      systemInstruction: `You are a job advertisement analyst. Extract only what the job advertisement explicitly supports. Do not invent requirements. Return concise structured data for matching a candidate resume.`,
      contents: [{role: 'user', parts: [{text: `Analyze this job advertisement:\n\nSoftware Engineer required. Must know Python, React, and SQL. 3 years experience. Bachelor's degree preferred.`}]}],
      responseSchema: jobAnalysisResponseSchema
    })

    console.log('Success:', aiResponse.success)
    console.log('Provider:', aiResponse.provider)
    if (aiResponse.success) {
      console.log('Data:', aiResponse.data)
      const json = JSON.parse(aiResponse.data)
      console.log('Parsed JSON keys:', Object.keys(json))
    } else {
      console.error('Error:', aiResponse.error)
    }
  } catch (err) {
    console.error('Caught Exception:', err)
  }
}

main()
