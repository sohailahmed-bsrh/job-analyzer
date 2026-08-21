import { GoogleGenAI } from '@google/genai'
import { env } from '../../config/env.js'

export class GeminiProvider {
  constructor(){
    this.model=env.GEMINI_MODEL
    // Keep both names for compatibility with existing generation services.
    // This also prevents the historical `undefined model` generation bug.
    this.modelId=this.model
    this.client=new GoogleGenAI({apiKey:env.GEMINI_API_KEY})
  }

  async generateStructured({systemInstruction,contents,responseSchema,tools=[]}){
    const response=await this.client.models.generateContent({
      model:this.modelId,
      contents,
      config:{
        systemInstruction,
        responseMimeType:'application/json',
        responseSchema,
        tools,
      },
    })
    if(!response.text)throw new Error('Gemini returned an empty response.')
    return response.text
  }

  async generateText({systemInstruction,contents}){
    const response=await this.client.models.generateContent({model:this.modelId,contents,config:{systemInstruction}})
    if(!response.text)throw new Error('Gemini returned an empty response.')
    return response.text
  }
}
export const gemini=new GeminiProvider()
