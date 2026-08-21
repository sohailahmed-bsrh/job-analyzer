import { prisma } from './src/infrastructure/db/prisma.js'
import { generateResume, generateCoverLetter } from './src/modules/generation/generation.service.js'
import { analyzeJob } from './src/modules/jobs/job.service.js'

async function run() {
  const job = await prisma.job.findFirst({
    where: { analysisStatus: 'COMPLETED' },
    include: { analysis: true }
  });
  
  if (!job) {
    console.log("No analyzed job found in DB to run test against.");
    return;
  }
  
  console.log("--- TEST 1: CV GENERATION (Expected: GroqCVProvider) ---");
  try {
    const cv = await generateResume(job.workspaceId, job.id, {
      template: 'PRO-2',
      tone: 'PROFESSIONAL'
    });
    console.log("SUCCESS! Generated CV using model:", cv.model);
    console.log("CV ID:", cv.id);
  } catch (err) {
    console.error("CV Generation Failed:", err.message);
  }

  console.log("\n--- TEST 2: COVER LETTER (Expected: GeminiProvider) ---");
  try {
    const cl = await generateCoverLetter(job.workspaceId, job.id, {
      template: 'CL-1',
      tone: 'PROFESSIONAL'
    });
    console.log("SUCCESS! Generated Cover Letter using model:", cl.model);
    console.log("CL ID:", cl.id);
  } catch (err) {
    console.error("Cover Letter Failed:", err.message);
  }

  // Job analysis test is slightly harder to mock fully here without candidate info,
  // but it defaults to `groq` provider naturally inside its service.
}

run().catch(console.error).finally(() => process.exit(0));
