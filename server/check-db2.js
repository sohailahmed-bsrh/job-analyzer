import { config } from 'dotenv';
config();
console.log('DATABASE_URL is:', process.env.DATABASE_URL);
import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaLibSql(libsql) });
prisma.candidateSource.findMany().then(console.log).catch(console.error);
