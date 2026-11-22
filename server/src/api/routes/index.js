import { Router } from 'express'
import { candidateRouter } from '../../modules/candidate/candidate.routes.js'
import { jobRouter } from '../../modules/jobs/job.routes.js'
import { generationRouter } from '../../modules/generation/generation.routes.js'
import { aiTestRouter } from './ai.test.routes.js'
export const apiRouter=Router()
apiRouter.use('/candidate',candidateRouter)
apiRouter.use('/jobs',jobRouter)
apiRouter.use('/ai', aiTestRouter)
apiRouter.use('/',generationRouter)
