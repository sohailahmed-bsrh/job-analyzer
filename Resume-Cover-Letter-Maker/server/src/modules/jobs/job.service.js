import { prisma } from '../../infrastructure/db/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { aiService } from '../../infrastructure/ai/ai.service.js'
import { jobAnalysisSchema, jobAnalysisResponseSchema, suggestionBatchSchema, suggestionBatchResponseSchema } from './job.analysis.schemas.js'

const urlPattern=/^https?:\/\/[^\s]+$/i

const MAX_CHARS = 5000;
const MAX_WORDS = 800;

function getWordCount(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
export async function createJob(workspaceId,{sourceType,content,title}){
 if(sourceType==='URL'&&!urlPattern.test(content))throw new AppError('Please provide a valid public HTTP(S) job URL.',422,null,'INVALID_JOB_URL')
 
 if (sourceType === 'TEXT') {
   if (content.length > MAX_CHARS) throw new AppError(`Job description exceeds maximum length of ${MAX_CHARS} characters.`, 422, null, 'JOB_TOO_LONG');
   if (getWordCount(content) > MAX_WORDS) throw new AppError(`Job description exceeds maximum length of ${MAX_WORDS} words.`, 422, null, 'JOB_TOO_LONG');
 }
 
 const job=await prisma.job.create({data:{workspaceId,sourceType,sourceContent:content,title:title||null,sourceUrl:sourceType==='URL'?content:null,sourceStatus:sourceType==='URL'?'PENDING':'DIRECT'}})
 return job
}
function safeParseJson(str, fallback) {
  if (typeof str !== 'string') return str || fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export async function getJob(workspaceId,id){
  const job=await prisma.job.findFirst({where:{id,workspaceId},include:{analysis:true, matchResults: true}});
  if(!job)throw new AppError('Job not found.',404,null,'JOB_NOT_FOUND');
  
  if (job.analysis) {
    job.analysis.requiredSkills = safeParseJson(job.analysis.requiredSkills, []);
    job.analysis.preferredSkills = safeParseJson(job.analysis.preferredSkills, []);
    job.analysis.responsibilities = safeParseJson(job.analysis.responsibilities, []);
    job.analysis.atsKeywords = safeParseJson(job.analysis.atsKeywords, []);
    job.analysis.rawModelJson = safeParseJson(job.analysis.rawModelJson, null);
  }
  
  if (job.matchResults) {
    job.matchResults = job.matchResults.map(m => ({
      ...m,
      matchedSkills: safeParseJson(m.matchedSkills, []),
      missingSkills: safeParseJson(m.missingSkills, []),
      evidenceGaps: safeParseJson(m.evidenceGaps, [])
    }));
  }
  
  return job;
}

export async function analyzeJob(workspaceId,id){
 const job=await getJob(workspaceId,id)
 
 let fetchedContent = job.sourceContent;
 if (job.sourceType === 'URL') {
   try {
     const response = await fetch(job.sourceContent);
     if (!response.ok) throw new Error('Failed to fetch');
     const html = await response.text();
     fetchedContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
   } catch (err) {
     throw new AppError('Unable to fetch job URL. Ensure the URL is public and accessible.', 422, null, 'URL_FETCH_FAILED');
   }
 }

 if (fetchedContent.length > MAX_CHARS) {
   throw new AppError(`The job posting at this URL is too long (exceeds ${MAX_CHARS} characters). Please paste the core responsibilities manually.`, 422, null, 'JOB_TOO_LONG');
 }
 if (getWordCount(fetchedContent) > MAX_WORDS) {
   throw new AppError(`The job posting at this URL is too long (exceeds ${MAX_WORDS} words). Please paste the core responsibilities manually.`, 422, null, 'JOB_TOO_LONG');
 }

 const system=`You are a job advertisement analyst. Extract only what the job advertisement explicitly supports. Do not invent requirements. Return concise structured data for matching a candidate resume.`
 const contents=job.sourceType==='URL' ? [{role:'user',parts:[{text:`Analyze this public job URL: ${job.sourceContent}. Extract requirements from the page.`}]}] : [{role:'user',parts:[{text:`Analyze this job advertisement:\n\n${job.sourceContent}`}]}]
 const tools=job.sourceType==='URL'?[{urlContext:{}}]:[]
 const aiResponse = await aiService.generateStructured({systemInstruction:system,contents,responseSchema:jobAnalysisResponseSchema,zodSchema:jobAnalysisSchema,tools})
 if (!aiResponse.success) throw new AppError(aiResponse.error.message, 500, null, aiResponse.error.code)
 const analysis = aiResponse.data
 if(analysis.requiredSkills.length===0&&analysis.responsibilities.length===0&&analysis.experienceRequirement===null&&analysis.educationRequirement===null)throw new AppError('The job analysis did not contain enough meaningful requirements.',422,null,'WEAK_JOB_ANALYSIS')
 await prisma.jobAnalysis.upsert({where:{jobId:id},create:{jobId:id,...analysis,responsibilities:JSON.stringify(analysis.responsibilities),requiredSkills:JSON.stringify(analysis.requiredSkills),preferredSkills:JSON.stringify(analysis.preferredSkills),atsKeywords:JSON.stringify(analysis.atsKeywords),rawModelJson:JSON.stringify(analysis)},update:{...analysis,responsibilities:JSON.stringify(analysis.responsibilities),requiredSkills:JSON.stringify(analysis.requiredSkills),preferredSkills:JSON.stringify(analysis.preferredSkills),atsKeywords:JSON.stringify(analysis.atsKeywords),rawModelJson:JSON.stringify(analysis)}})
 await prisma.job.update({where:{id},data:{analysisStatus:'COMPLETED',normalizedDescription:analysis.summary,sourceStatus:'RESOLVED'}})
 return getJob(workspaceId,id)
}

export async function buildSuggestions(workspaceId,id){
 const job=await prisma.job.findFirst({where:{id,workspaceId},include:{analysis:true}});if(!job?.analysis)throw new AppError('Analyze the job before generating suggestions.',409,null,'ANALYSIS_REQUIRED')
 const profile=await prisma.candidateProfile.findUnique({where:{workspaceId},include:{skills:true,education:true,experience:true}});if(!profile)throw new AppError('Complete your candidate profile first.',409,null,'PROFILE_REQUIRED')
 const system=`You are a career coach. Suggest only factual additions the candidate can review. Never tell the user to invent experience. Identify evidence gaps against the job requirements and propose ways to clarify existing evidence.`
 const prompt={candidate:{summary:profile.summary,skills:profile.skills.map(s=>s.name),education:profile.education,experience:profile.experience},job:job.analysis}
 const aiResponse = await aiService.generateStructured({systemInstruction:system,contents:`Candidate and job data:\n${JSON.stringify(prompt)}`,responseSchema:suggestionBatchResponseSchema,zodSchema:suggestionBatchSchema})
 if (!aiResponse.success) throw new AppError(aiResponse.error.message, 500, null, aiResponse.error.code)
 const batch = aiResponse.data
 await prisma.candidateSuggestion.deleteMany({where:{jobId:id,status:'PENDING'}})
 await prisma.candidateSuggestion.createMany({data:batch.suggestions.map(s=>({profileId:profile.id,jobId:id,title:s.title,reason:s.reason,proposedEvidence:s.proposedEvidence,targetSection:s.targetSection}))})
 return listSuggestions(workspaceId,id)
}
export async function listSuggestions(workspaceId,id){const job=await getJob(workspaceId,id);return prisma.candidateSuggestion.findMany({where:{jobId:job.id},orderBy:{createdAt:'asc'}})}
export async function approveSuggestion(workspaceId,id,suggestionId){const job=await getJob(workspaceId,id);const suggestion=await prisma.candidateSuggestion.updateMany({where:{id:suggestionId,jobId:job.id},data:{status:'APPROVED'}});if(!suggestion.count)throw new AppError('Suggestion not found.',404,null,'SUGGESTION_NOT_FOUND');return prisma.candidateSuggestion.findUnique({where:{id:suggestionId}})}

export async function matchJob(workspaceId,id){
 const job=await prisma.job.findFirst({where:{id,workspaceId},include:{analysis:true}});if(!job?.analysis)throw new AppError('Analyze the job first.',409,null,'ANALYSIS_REQUIRED')
 const profile=await prisma.candidateProfile.findUnique({where:{workspaceId},include:{skills:true,education:true,experience:true}});if(!profile)throw new AppError('Complete your candidate profile first.',409,null,'PROFILE_REQUIRED')
 const candidateSkills=new Set(profile.skills.map(s=>s.name.toLowerCase()));
 let reqSkills = [];
 try { reqSkills = typeof job.analysis.requiredSkills === 'string' ? JSON.parse(job.analysis.requiredSkills) : job.analysis.requiredSkills; } catch (e) {}
 const required=[...new Set((reqSkills||[]).map(s=>String(s).toLowerCase()))]
 const matched=required.filter(s=>candidateSkills.has(s));const missing=required.filter(s=>!candidateSkills.has(s));
 // Never interpret 0/0 as 95%. When no explicit required skills exist, use an unavailable score.
 const score=required.length===0?null:(matched.length/required.length)*100
 const explanation=required.length===0?'No explicit skill requirements were extracted, so a skill match score is intentionally unavailable.':`${matched.length} of ${required.length} required skills are directly present in the candidate skill list.`
 await prisma.matchResult.create({data:{jobId:id,score,matchedSkills:JSON.stringify(matched),missingSkills:JSON.stringify(missing),evidenceGaps:JSON.stringify(missing),explanation}})
 if((await prisma.candidateSuggestion.count({where:{jobId:id}}))===0)await buildSuggestions(workspaceId,id)
 return {score,matchedSkills:matched,missingSkills:missing,evidenceGaps:missing,explanation}
}
