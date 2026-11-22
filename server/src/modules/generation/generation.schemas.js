import { z } from 'zod'

export const resumeGenerationSchema = z.object({ template: z.string().min(1), tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'DIRECT']) })
export const coverLetterGenerationSchema = z.object({ template: z.string().optional(), tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'DIRECT']) })

const resumeJson = z.object({
  header: z.object({
    fullName: z.string(),
    title: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    portfolio: z.string().nullable().optional()
  }),
  summary: z.string(),
  skills: z.array(z.string()).nullish().transform(v => v || []),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    location: z.string().nullable().optional(),
    dates: z.string(),
    bullets: z.array(z.string()).nullish().transform(v => v || [])
  })).nullish().transform(v => v || []),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    location: z.string().nullable().optional(),
    dates: z.string()
  })).nullish().transform(v => v || []),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).nullish().transform(v => v || [])
  })).nullish().transform(v => v || []),
  certifications: z.array(z.string()).nullish().transform(v => v || []),
  languages: z.array(z.string()).nullish().transform(v => v || [])
})

const letterJson = z.object({
  sender: z.object({
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional()
  }).optional(),
  date: z.string(),
  recipient: z.object({
    name: z.string().nullable().optional(),
    company: z.string()
  }).optional(),
  subject: z.string().nullable().optional(),
  greeting: z.string(),
  openingParagraph: z.string(),
  bodyParagraphs: z.array(z.string()),
  closingParagraph: z.string(),
  signOff: z.string()
})

export const resumeOutputSchema = resumeJson
export const coverLetterOutputSchema = letterJson

export const resumeResponseSchema = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        title: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        location: { type: 'string', nullable: true },
        linkedin: { type: 'string', nullable: true },
        portfolio: { type: 'string', nullable: true }
      },
      required: ['fullName', 'title']
    },
    summary: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          location: { type: 'string', nullable: true },
          dates: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } }
        },
        required: ['company', 'title', 'dates', 'bullets']
      }
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          location: { type: 'string', nullable: true },
          dates: { type: 'string' }
        },
        required: ['institution', 'degree', 'dates']
      }
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' }, nullable: true }
        },
        required: ['name', 'description']
      },
      nullable: true
    },
    certifications: { type: 'array', items: { type: 'string' }, nullable: true },
    languages: { type: 'array', items: { type: 'string' }, nullable: true }
  },
  required: ['header', 'summary', 'skills', 'experience', 'education']
}

export const coverLetterResponseSchema = {
  type: 'object',
  properties: {
    sender: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true }
      },
      required: ['name'],
      nullable: true
    },
    date: { type: 'string' },
    recipient: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        company: { type: 'string' }
      },
      required: ['company'],
      nullable: true
    },
    subject: { type: 'string', nullable: true },
    greeting: { type: 'string' },
    openingParagraph: { type: 'string' },
    bodyParagraphs: { type: 'array', items: { type: 'string' } },
    closingParagraph: { type: 'string' },
    signOff: { type: 'string' }
  },
  required: ['date', 'greeting', 'openingParagraph', 'bodyParagraphs', 'closingParagraph', 'signOff']
}
