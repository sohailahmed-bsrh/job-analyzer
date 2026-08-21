import { prisma } from './src/infrastructure/db/prisma.js'
import { generateResume } from './src/modules/generation/generation.service.js'

async function run() {
  const job = await prisma.job.findFirst({
    where: { analysisStatus: 'COMPLETED' },
    include: { analysis: true }
  });
  
  if (!job) {
    console.log("No analyzed job found in DB to run test against.");
    return;
  }
  
  console.log("Testing generateResume with jobId:", job.id);
  console.log("This will explicitly route to Groq as primary, Gemini as fallback.");
  
  try {
    const doc = await generateResume(job.workspaceId, job.id, {
      template: 'PRO-2',
      tone: 'PROFESSIONAL'
    });
    
    console.log("Successfully generated document!");
    console.log("Model used:", doc.model);
    console.log("Document ID:", doc.id);
  } catch (error) {
    console.error("Failed to generate CV:", error);
  }
}

run().catch(console.error).finally(() => process.exit(0));
