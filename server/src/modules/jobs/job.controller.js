import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './job.service.js'
export const create=asyncHandler(async(req,res)=>res.status(201).json({job:await service.createJob(req.workspaceId,req.body)}))
export const get=asyncHandler(async(req,res)=>res.json({job:await service.getJob(req.workspaceId,req.params.id)}))
export const analyze=asyncHandler(async(req,res)=>res.json({job:await service.analyzeJob(req.workspaceId,req.params.id)}))
export const match=asyncHandler(async(req,res)=>res.json({match:await service.matchJob(req.workspaceId,req.params.id)}))
export const suggestions=asyncHandler(async(req,res)=>res.json({suggestions:await service.listSuggestions(req.workspaceId,req.params.id)}))
export const approveSuggestion=asyncHandler(async(req,res)=>res.json({suggestion:await service.approveSuggestion(req.workspaceId,req.params.id,req.params.suggestionId)}))
