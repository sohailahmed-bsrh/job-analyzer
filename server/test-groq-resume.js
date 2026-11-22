import 'dotenv/config'
import { aiService } from './src/infrastructure/ai/ai.service.js'
import { resumeResponseSchema } from './src/modules/generation/generation.schemas.js'

async function main() {
  console.log('Testing resume generation via Groq...')
  try {
    const aiResponse = await aiService.generateStructured({
      systemInstruction: 'You are an expert resume writer. Output only structured JSON matching the schema.',
      contents: `Candidate: {"name":"John Doe","skills":["Python","React","SQL"],"experience":[{"company":"TechCorp","title":"Developer","dates":"2020-2023","bullets":["Did things"]}]} Job: {"roleTitle":"Software Engineer"} Tone: PROFESSIONAL`,
      responseSchema: resumeResponseSchema
    })

    console.log('Success:', aiResponse.success)
    console.log('Provider:', aiResponse.provider)
    if (aiResponse.success) {
      const json = JSON.parse(aiResponse.data)
      console.log('Parsed JSON title:', json.title)
    } else {
      console.error('Error:', aiResponse.error)
    }
  } catch (err) {
    console.error('Caught Exception:', err)
  }
}

main()
