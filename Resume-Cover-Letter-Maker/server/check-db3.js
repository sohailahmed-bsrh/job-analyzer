import { config } from 'dotenv';
config();
console.log('DATABASE_URL is:', process.env.DATABASE_URL);

async function run() {
  const { PrismaClient } = await import('./src/generated/prisma/index.js');
  const { PrismaLibSql } = await import('@prisma/adapter-libsql');
  const { createClient } = await import('@libsql/client');

  const libsql = createClient({ url: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaLibSql(libsql), url: process.env.DATABASE_URL });
  
  const sources = await prisma.candidateSource.findMany();
  console.log('Sources:', sources);
}
run().catch(console.error);
