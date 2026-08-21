import express from 'express'
import cors from 'cors'
import { apiRouter } from './api/routes/index.js'
import { env } from './config/env.js'
import { errorHandler } from './api/middleware/errorHandler.js'
import { ensureStorage } from './infrastructure/storage/localStorage.js'

export async function createApp(){
 const app=express();await ensureStorage()
 app.disable('x-powered-by')
 app.use(cors({origin:env.WEB_ORIGIN,credentials:true}))
 app.use(express.json({limit:'1mb'}));app.use(express.urlencoded({extended:true}));
 app.get('/health',(_req,res)=>res.json({ok:true,service:'careerbridge-server'}))
 app.use('/api/v1',apiRouter)
 app.use(errorHandler)
 return app
}
