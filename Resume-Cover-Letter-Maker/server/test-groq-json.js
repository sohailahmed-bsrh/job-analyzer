import 'dotenv/config'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function testModel(modelId) {
  try {
    console.log(`Testing model: ${modelId}`)
    const response = await groq.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: 'You are a test bot. You MUST return ONLY valid JSON. The JSON must strictly adhere to this JSON Schema:\n{"type":"object","properties":{"status":{"type":"string"}},"required":["status"]}' },
        { role: 'user', content: 'Say OK.' }
      ],
      response_format: { type: 'json_object' }
    })
    console.log(`Success for ${modelId}:`, response.choices[0].message.content)
  } catch (err) {
    console.error(`Error for ${modelId}:`, err.message)
  }
}

async function main() {
  await testModel('qwen/qwen3.6-27b')
  await testModel('groq/compound')
  await testModel('openai/gpt-oss-120b')
  await testModel('openai/gpt-oss-20b')
}

main()
