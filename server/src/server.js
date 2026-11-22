import { createApp } from './app.js'
import { env } from './config/env.js'
import { disconnectDb } from './infrastructure/db/prisma.js'
const app=await createApp();const server=app.listen(env.PORT,()=>console.log(`CareerBridge API listening on ${env.PORT}`))
async function shutdown(){server.close(async()=>{await disconnectDb();process.exit(0)})}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown)
