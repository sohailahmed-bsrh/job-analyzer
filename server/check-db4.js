import { config } from 'dotenv';
config();
console.log('DATABASE_URL is:', process.env.DATABASE_URL);

async function run() {
  const { PrismaClient } = await import('./src/generated/prisma/index.js');
  const prisma = new PrismaClient();
  const sources = await prisma.candidateSource.findMany();
  console.log('Sources:', sources);
}
run().catch(console.error);
