import { prisma } from './server/src/infrastructure/db/prisma.js';
import { generateResume } from './server/src/modules/generation/generation.service.js';
import { saveProfile } from './server/src/modules/candidate/candidate.service.js';

async function run() {
  const workspaceId = 'test-workspace-photo';
  const jobId = 'test-job-photo';
  
  // 1. Setup mock job
  await prisma.job.deleteMany({ where: { workspaceId } });
  await prisma.candidateProfile.deleteMany({ where: { workspaceId } });
  
  const job = await prisma.job.create({
    data: {
      id: jobId,
      workspaceId,
      sourceType: 'TEXT',
      sourceContent: 'Need a developer',
      title: 'Dev'
    }
  });
  await prisma.jobAnalysis.create({
    data: {
      jobId,
      responsibilities: 'Code',
      requiredSkills: 'JS',
      preferredSkills: '',
      atsKeywords: 'JS'
    }
  });
  
  // 2. Simulate Save Profile (Photo: 50KB base64)
  const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const mockProfile = {
    name: 'Photo Test',
    email: 'test@photo.com',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photoUrl: mockBase64,
    headline: '',
    location: '',
    summary: 'Test summary',
    skills: [],
    education: [],
    experience: []
  };
  
  await saveProfile(workspaceId, mockProfile);
  console.log('Saved profile with photoUrl');
  
  // 3. Generate Resume
  console.log('Generating resume...');
  const doc = await generateResume(workspaceId, jobId, { template: 'PRO-2', tone: 'PROFESSIONAL' });
  
  // 4. Check HTML
  if (doc.html && doc.html.includes(mockBase64)) {
    console.log('SUCCESS! Photo is in HTML.');
  } else {
    console.log('FAILURE! Photo is missing from HTML.');
    console.log(doc.html.substring(0, 500));
  }
}

run().catch(console.error).finally(() => process.exit(0));
