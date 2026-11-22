import { z } from 'zod'
export const candidateExtractionSchema=z.object({
  name:z.string().default(''),email:z.string().nullable().default(''),phone:z.string().nullable().default(''),linkedin:z.string().nullable().default(''),github:z.string().nullable().default(''),portfolio:z.string().nullable().default(''),headline:z.string().default(''),location:z.string().default(''),summary:z.string().default(''),
  skills:z.array(z.string()).default([]),
  education:z.array(z.object({institution:z.string(),degree:z.string(),field:z.string().nullable(),startDate:z.string().nullable(),endDate:z.string().nullable(),details:z.string().nullable()})).default([]),
  experience:z.array(z.object({company:z.string(),title:z.string(),startDate:z.string().nullable(),endDate:z.string().nullable(),description:z.string().nullable()})).default([])
})
export const candidateExtractionResponseSchema={type:'object',properties:{
 name:{type:'string'},email:{type:['string','null']},phone:{type:['string','null']},linkedin:{type:['string','null']},github:{type:['string','null']},portfolio:{type:['string','null']},headline:{type:'string'},location:{type:'string'},summary:{type:'string'},skills:{type:'array',items:{type:'string'}},
 education:{type:'array',items:{type:'object',properties:{institution:{type:'string'},degree:{type:'string'},field:{type:['string','null']},startDate:{type:['string','null']},endDate:{type:['string','null']},details:{type:['string','null']}},required:['institution','degree','field','startDate','endDate','details']}},
 experience:{type:'array',items:{type:'object',properties:{company:{type:'string'},title:{type:'string'},startDate:{type:['string','null']},endDate:{type:['string','null']},description:{type:['string','null']}},required:['company','title','startDate','endDate','description']}}
},required:['name','headline','location','summary','skills','education','experience']}
