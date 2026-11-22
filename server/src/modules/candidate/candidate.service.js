import { prisma } from '../../infrastructure/db/prisma.js'
import { extractText } from '../../infrastructure/parsing/documentParser.js'
import { saveFile } from '../../infrastructure/storage/localStorage.js'
import { AppError } from '../../utils/AppError.js'
import pathModule from 'node:path'
import { env } from '../../config/env.js'
import { aiService } from '../../infrastructure/ai/ai.service.js'
import { candidateExtractionSchema, candidateExtractionResponseSchema } from './candidate.ai.schemas.js'

function payload(profile){return {name:profile.name,email:profile.email||'',phone:profile.phone||'',linkedin:profile.linkedin||'',github:profile.github||'',portfolio:profile.portfolio||'',photoUrl:profile.photoUrl||'',headline:profile.headline||'',location:profile.location||'',summary:profile.summary||'',skills:profile.skills.map(s=>s.name),education:profile.education,experience:profile.experience}}

export async function getProfile(workspaceId){let profile=await prisma.candidateProfile.findUnique({where:{workspaceId},include:{skills:true,education:true,experience:true}});if(!profile){profile=await prisma.candidateProfile.create({data:{workspaceId,name:''},include:{skills:true,education:true,experience:true}})}return payload(profile)}
export async function saveProfile(workspaceId,data){const profile=await prisma.candidateProfile.upsert({where:{workspaceId},create:{workspaceId,name:data.name,email:data.email,phone:data.phone,linkedin:data.linkedin,github:data.github,portfolio:data.portfolio,photoUrl:data.photoUrl,headline:data.headline,location:data.location,summary:data.summary},update:{name:data.name,email:data.email,phone:data.phone,linkedin:data.linkedin,github:data.github,portfolio:data.portfolio,photoUrl:data.photoUrl,headline:data.headline,location:data.location,summary:data.summary}})
 await prisma.$transaction([
  prisma.skill.deleteMany({where:{profileId:profile.id}}),
  prisma.skill.createMany({data:data.skills.map(name=>({profileId:profile.id,name}))}),
  prisma.education.deleteMany({where:{profileId:profile.id}}),
  prisma.experience.deleteMany({where:{profileId:profile.id}}),
  ...data.education.map(e=>prisma.education.create({data:{profileId:profile.id,institution:e.institution,degree:e.degree,field:e.field,startDate:e.startDate,endDate:e.endDate,details:e.details}})),
  ...data.experience.map(e=>prisma.experience.create({data:{profileId:profile.id,company:e.company,title:e.title,startDate:e.startDate,endDate:e.endDate,description:e.description}})),
 ])
 return getProfile(workspaceId)
}

export async function processUpload(workspaceId,file){
 if(!file)throw new AppError('Please upload a PDF or DOCX file.',422,null,'FILE_REQUIRED')
 const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];if(!allowed.includes(file.mimetype))throw new AppError('Only PDF and DOCX files are supported.',422,null,'UNSUPPORTED_FILE')
 const key=await saveFile(file);const uploadDir=env.UPLOAD_DIR;const path=requirePath(uploadDir,key);const rawText=await extractText(path,file.mimetype);if(!rawText.trim())throw new AppError('No readable text was found in this file.',422,null,'EMPTY_DOCUMENT')
 const existing=await prisma.candidateProfile.findUnique({where:{workspaceId}});const profile=existing||await prisma.candidateProfile.create({data:{workspaceId,name:''}})
 await prisma.candidateSource.create({data:{profileId:profile.id,fileName:file.originalname,mimeType:file.mimetype,storageKey:key,extractedAt:new Date()}})
 await prisma.candidateProfile.update({where:{id:profile.id},data:{rawText:rawText.slice(0,100000)}})
  const aiResponse = await aiService.generateStructured({
    systemInstruction:'You are a rigorous data extractor. Extract only factual candidate information explicitly stated in the uploaded CV. Do not invent missing details, dates, companies, or skills. Return structured JSON for a human review step.',
    contents:`Extract candidate profile data from this CV text:\n\n${rawText.slice(0,100000)}`,
    responseSchema:candidateExtractionResponseSchema,
    zodSchema:candidateExtractionSchema
  })
  if (!aiResponse.success) throw new AppError(aiResponse.error.message, 500, null, aiResponse.error.code)
  const extracted = aiResponse.data
  await prisma.candidateProfile.update({where:{id:profile.id},data:{name:extracted.name,email:extracted.email,phone:extracted.phone,linkedin:extracted.linkedin,github:extracted.github,portfolio:extracted.portfolio,headline:extracted.headline,location:extracted.location,summary:extracted.summary,rawText:rawText.slice(0,100000)}})
 await prisma.$transaction([
   prisma.skill.deleteMany({where:{profileId:profile.id}}),
   prisma.skill.createMany({data:extracted.skills.map(name=>({profileId:profile.id,name}))}),
   prisma.education.deleteMany({where:{profileId:profile.id}}),
   prisma.experience.deleteMany({where:{profileId:profile.id}}),
   ...extracted.education.map(e=>prisma.education.create({data:{profileId:profile.id,institution:e.institution,degree:e.degree,field:e.field||null,startDate:e.startDate||null,endDate:e.endDate||null,details:e.details||null}})),
   ...extracted.experience.map(e=>prisma.experience.create({data:{profileId:profile.id,company:e.company,title:e.title,startDate:e.startDate||null,endDate:e.endDate||null,description:e.description||null}})),
 ])
 return {profile:await getProfile(workspaceId),rawText:rawText.slice(0,100000)}
}

function requirePath(uploadDir,key){return pathModule.isAbsolute(uploadDir)?pathModule.join(uploadDir,key):pathModule.join(process.cwd(),uploadDir,key)}
