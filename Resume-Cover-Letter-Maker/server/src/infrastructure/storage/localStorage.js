import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { env } from '../../config/env.js'

export async function ensureStorage(){await fs.mkdir(env.UPLOAD_DIR,{recursive:true})}
export async function saveFile(file){const ext=path.extname(file.originalname);const key=`${Date.now()}-${crypto.randomUUID()}${ext}`;const target=path.join(env.UPLOAD_DIR,key);await fs.writeFile(target,file.buffer);return key}
