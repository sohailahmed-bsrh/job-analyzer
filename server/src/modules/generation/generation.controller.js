import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './generation.service.js'
import { prisma } from '../../infrastructure/db/prisma.js'
import { renderPdf } from '../../infrastructure/pdf/pdfExport.js'
export const resume=asyncHandler(async(req,res)=>res.status(201).json({document:await service.generateResume(req.workspaceId,req.params.id,req.body)}))
export const coverLetter=asyncHandler(async(req,res)=>res.status(201).json({document:await service.generateCoverLetter(req.workspaceId,req.params.id,req.body)}))
export const getDocument=asyncHandler(async(req,res)=>res.json({document:await service.getDocument(req.workspaceId,req.params.id)}))
export const getDocumentHtml=asyncHandler(async(req,res)=>{
  const doc=await service.getDocument(req.workspaceId,req.params.id);
  res.setHeader('Content-Type','text/html');
  res.send(doc.html);
})
export const exportPdf=asyncHandler(async(req,res)=>{const doc=await service.getDocument(req.workspaceId,req.params.id);const pdf=await renderPdf(doc);res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${doc.type.toLowerCase()}-${doc.id}.pdf"`);res.send(pdf)})
