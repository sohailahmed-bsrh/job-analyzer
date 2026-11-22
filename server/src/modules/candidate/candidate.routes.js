import { Router } from 'express'
import multer from 'multer'
import { env } from '../../config/env.js'
import * as controller from './candidate.controller.js'
import { requireWorkspace } from '../../api/middleware/workspace.js'
import { validate } from '../../api/middleware/validate.js'
import { profileSchema } from './candidate.schemas.js'
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:env.MAX_UPLOAD_MB*1024*1024}})
export const candidateRouter=Router();candidateRouter.use(requireWorkspace)
candidateRouter.get('/profile',controller.getProfile)
candidateRouter.put('/profile',validate(profileSchema),controller.saveProfile)
candidateRouter.post('/resume-upload',upload.single('file'),controller.uploadResume)
