import { z } from 'zod'
const education=z.object({id:z.string().optional(),institution:z.string().min(1),degree:z.string().min(1),field:z.string().optional(),startDate:z.string().optional(),endDate:z.string().optional(),details:z.string().optional()})
const experience=z.object({id:z.string().optional(),company:z.string().min(1),title:z.string().min(1),startDate:z.string().optional(),endDate:z.string().optional(),description:z.string().optional()})
export const profileSchema=z.object({name:z.string().min(2),headline:z.string().optional(),location:z.string().optional(),summary:z.string().optional(),skills:z.array(z.string()).default([]),education:z.array(education).default([]),experience:z.array(experience).default([])})
