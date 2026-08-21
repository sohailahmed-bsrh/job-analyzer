import { z } from 'zod'

export const jobAnalysisSchema=z.object({
  companyName:z.string().nullable(),roleTitle:z.string().nullable(),summary:z.string().min(20),responsibilities:z.array(z.string()),requiredSkills:z.array(z.string()),preferredSkills:z.array(z.string()),experienceRequirement:z.string().nullable(),educationRequirement:z.string().nullable(),atsKeywords:z.array(z.string()),confidence:z.number().min(0).max(1)
})
export const jobAnalysisResponseSchema={type:'object',properties:{
 companyName:{type:['string','null']},roleTitle:{type:['string','null']},summary:{type:'string'},responsibilities:{type:'array',items:{type:'string'}},requiredSkills:{type:'array',items:{type:'string'}},preferredSkills:{type:'array',items:{type:'string'}},experienceRequirement:{type:['string','null']},educationRequirement:{type:['string','null']},atsKeywords:{type:'array',items:{type:'string'}},confidence:{type:'number'}
},required:['companyName','roleTitle','summary','responsibilities','requiredSkills','preferredSkills','experienceRequirement','educationRequirement','atsKeywords','confidence']}
export const suggestionSchema=z.object({title:z.string(),reason:z.string(),proposedEvidence:z.string().nullable(),targetSection:z.enum(['SUMMARY','SKILLS','EXPERIENCE','EDUCATION'])})
export const suggestionBatchSchema=z.object({suggestions:z.array(suggestionSchema).max(12)})
export const suggestionBatchResponseSchema={type:'object',properties:{suggestions:{type:'array',items:{type:'object',properties:{title:{type:'string'},reason:{type:'string'},proposedEvidence:{type:['string','null']},targetSection:{type:'string',enum:['SUMMARY','SKILLS','EXPERIENCE','EDUCATION']}},required:['title','reason','proposedEvidence','targetSection']}}},required:['suggestions']}
