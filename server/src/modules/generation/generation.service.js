import { prisma } from '../../infrastructure/db/prisma.js'
import { aiService } from '../../infrastructure/ai/ai.service.js'
import { resumeOutputSchema, coverLetterOutputSchema, resumeResponseSchema, coverLetterResponseSchema } from './generation.schemas.js'
import { renderResume, renderCoverLetter } from '../documents/renderers.js'
import { AppError } from '../../utils/AppError.js'

async function context(workspaceId,jobId){const [profile,job]=await Promise.all([prisma.candidateProfile.findUnique({where:{workspaceId},include:{skills:true,education:true,experience:true}}),prisma.job.findFirst({where:{id:jobId,workspaceId},include:{analysis:true}})]);if(!profile||!job?.analysis)throw new AppError('Candidate profile and analyzed job are required.',409,null,'GENERATION_PREREQUISITES');const approvals=await prisma.candidateSuggestion.findMany({where:{jobId,status:'APPROVED'}});return {profile,job,approvals}}

export async function generateResume(workspaceId,jobId,{template,tone}){
  const {profile,job,approvals}=await context(workspaceId,jobId);
  const prompt=`Create a job-tailored resume using only candidate evidence. Never fabricate employers, dates, degrees, technologies, metrics, or responsibilities. Rephrase truthful evidence to align with job terminology. Template: ${template}. Tone: ${tone}. Candidate: ${JSON.stringify(profile)} Approved suggestions: ${JSON.stringify(approvals)} Job: ${JSON.stringify(job.analysis)}`;
  
  const aiResponse = await aiService.generateStructured({
    systemInstruction:'You are an expert resume writer. Output only structured JSON matching the schema. Every factual claim must be grounded in candidate data. Expand the header with available contact info.',
    contents:prompt,
    responseSchema:resumeResponseSchema,
    zodSchema:resumeOutputSchema
  }, { primaryProvider: 'groqCV', fallbackProvider: 'gemini' })
  
  if (!aiResponse.success) throw new AppError(aiResponse.error.message, 500, null, aiResponse.error.code)
  
  const result = aiResponse.data;
  result.photoUrl = profile.photoUrl;
  const html=renderResume(result, template);
  
  const doc=await prisma.generatedDocument.create({
    data:{workspaceId,jobId,type:'RESUME',template,tone,status:'GENERATED',title:result.header.title || 'Resume',plainText:result.summary,html,model:aiResponse.provider}
  });
  return doc
}

export async function generateCoverLetter(workspaceId,jobId,{template,tone}){
  const {profile,job}=await context(workspaceId,jobId);
  const prompt=`Write a concise cover letter for this role. Do not invent company facts or candidate experience. Use the candidate's genuine background and the job requirements. Tone: ${tone}. Candidate: ${JSON.stringify(profile)} Job: ${JSON.stringify(job.analysis)}`;
  
  const aiResponse = await aiService.generateStructured({
    systemInstruction:'You are a professional cover-letter writer. Return structured JSON with proper letter sections.',
    contents:prompt,
    responseSchema:coverLetterResponseSchema,
    zodSchema:coverLetterOutputSchema
  }, { primaryProvider: 'gemini', fallbackProvider: null })
  
  if (!aiResponse.success) throw new AppError(aiResponse.error.message, 500, null, aiResponse.error.code)
  
  const result = aiResponse.data;
  const html=renderCoverLetter(result, template);
  
  const doc=await prisma.generatedDocument.create({
    data:{workspaceId,jobId,type:'COVER_LETTER',template,tone,status:'GENERATED',title:result.subject || 'Cover Letter',plainText:result.openingParagraph,html,model:aiResponse.provider}
  });
  return doc
}

export async function getDocument(workspaceId,id){
  const doc=await prisma.generatedDocument.findFirst({where:{id,workspaceId}});
  if(!doc)throw new AppError('Document not found.',404,null,'DOCUMENT_NOT_FOUND');
  return doc
}
