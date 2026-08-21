import fs from 'fs';
import { prisma } from './server/src/infrastructure/db/prisma.js';
import { candidateService } from './server/src/modules/candidate/candidate.service.js';
import { jobService } from './server/src/modules/jobs/job.service.js';
import { generateResume, generateCoverLetter } from './server/src/modules/generation/generation.service.js';
import { renderPdf } from './server/src/infrastructure/pdf/pdfExport.js';

async function testE2E() {
  const workspaceId = 'e2e-test-workspace-' + Date.now();
  console.log('1. Starting E2E test for workspace', workspaceId);

  // 1. Save profile
  console.log('2. Saving Profile...');
  const profile = {
    name: 'Jane Doe',
    headline: 'Senior Full Stack Developer',
    location: 'Remote',
    summary: 'A passionate developer.',
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    experience: [{
      company: 'Tech Corp',
      title: 'Senior Developer',
      startDate: '2020',
      endDate: 'Present',
      description: 'Built scalable web apps.'
    }],
    education: []
  };
  await candidateService.saveProfile(workspaceId, profile);

  // 2. Add job
  console.log('3. Analyzing Job...');
  const job = await jobService.create(workspaceId, {
    sourceType: 'TEXT',
    title: 'Senior Frontend Engineer',
    content: 'We are looking for a Senior Frontend Engineer with strong React and JavaScript skills.'
  });
  
  await jobService.analyze(workspaceId, job.id);
  await jobService.match(workspaceId, job.id);
  const suggestions = await jobService.suggestions(workspaceId, job.id);
  
  if (suggestions.suggestions.length > 0) {
    console.log('4. Approving suggestion...');
    await jobService.approveSuggestion(workspaceId, job.id, suggestions.suggestions[0].id);
  }

  // 3. Generate documents
  console.log('5. Generating ATS Resume & Cover Letter...');
  const resume = await generateResume(workspaceId, job.id, { template: 'ATS', tone: 'PROFESSIONAL' });
  const coverLetter = await generateCoverLetter(workspaceId, job.id, { tone: 'PROFESSIONAL' });

  console.log('Resume ID:', resume.id);
  console.log('Cover Letter ID:', coverLetter.id);

  if (!resume.html || !coverLetter.html) {
    throw new Error('HTML was not generated.');
  }

  // 4. Export PDF
  console.log('6. Exporting PDFs via renderPdf...');
  const resumePdf = await renderPdf(resume);
  const letterPdf = await renderPdf(coverLetter);

  fs.writeFileSync('e2e-test-resume.pdf', resumePdf);
  fs.writeFileSync('e2e-test-cover-letter.pdf', letterPdf);

  console.log('7. SUCCESS! PDFs written to disk.');
}

testE2E().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
