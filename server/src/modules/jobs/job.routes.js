import { Router } from 'express'
import * as controller from './job.controller.js'
import { requireWorkspace } from '../../api/middleware/workspace.js'
import { validate } from '../../api/middleware/validate.js'
import { createJobSchema } from './job.schemas.js'
export const jobRouter=Router();jobRouter.use(requireWorkspace)
jobRouter.post('/',validate(createJobSchema),controller.create)
jobRouter.get('/:id',controller.get)
jobRouter.post('/:id/analyze',controller.analyze)
jobRouter.post('/:id/match',controller.match)
jobRouter.get('/:id/suggestions',controller.suggestions)
jobRouter.post('/:id/suggestions/:suggestionId/approve',controller.approveSuggestion)
