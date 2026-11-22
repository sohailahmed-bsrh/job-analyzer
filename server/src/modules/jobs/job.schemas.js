import { z } from 'zod'
export const createJobSchema=z.object({sourceType:z.enum(['TEXT','URL']),content:z.string().trim().min(10).max(5000),title:z.string().trim().max(200).optional()})
