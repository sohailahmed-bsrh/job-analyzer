import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './candidate.service.js'
export const getProfile=asyncHandler(async(req,res)=>res.json({profile:await service.getProfile(req.workspaceId)}))
export const saveProfile=asyncHandler(async(req,res)=>res.json({profile:await service.saveProfile(req.workspaceId,req.body)}))
export const uploadResume=asyncHandler(async(req,res)=>res.json(await service.processUpload(req.workspaceId,req.file)))
