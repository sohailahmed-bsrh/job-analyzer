import { config } from 'dotenv';
config();
import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter: new PrismaLibSql(libsql) });

async function check() {
  const sources = await prisma.candidateSource.findMany();
  console.log('Sources:', sources);
  const profiles = await prisma.candidateProfile.findMany();
  console.log('Profiles:', profiles.map(p => ({ ...p, rawText: p.rawText ? 'exists' : 'null' })));
}
check().catch(console.error);
