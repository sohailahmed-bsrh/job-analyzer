import { Router } from 'express'
import * as controller from './generation.controller.js'
import { requireWorkspace } from '../../api/middleware/workspace.js'
import { validate } from '../../api/middleware/validate.js'
import { resumeGenerationSchema, coverLetterGenerationSchema } from './generation.schemas.js'
export const generationRouter=Router();generationRouter.use(requireWorkspace)
generationRouter.post('/jobs/:id/generate/resume',validate(resumeGenerationSchema),controller.resume)
generationRouter.post('/jobs/:id/generate/cover-letter',validate(coverLetterGenerationSchema),controller.coverLetter)
generationRouter.get('/documents/:id',controller.getDocument)
generationRouter.get('/documents/:id/html',controller.getDocumentHtml)
generationRouter.get('/documents/:id/export/pdf',controller.exportPdf)
