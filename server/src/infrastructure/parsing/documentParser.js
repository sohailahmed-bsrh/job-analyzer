import fs from 'node:fs/promises'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

export async function extractText(filePath,mimeType){
  const buffer=await fs.readFile(filePath)
  let text = '';
  if(mimeType==='application/pdf') text = (await pdf(buffer)).text
  else if(mimeType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document') text = (await mammoth.extractRawText({buffer})).value
  else throw new Error('Unsupported file type.')

  if (!text || text.trim().length < 20) {
    throw new Error('This document appears to be a scanned image or empty. Please enter your profile manually.')
  }
  return text;
}
