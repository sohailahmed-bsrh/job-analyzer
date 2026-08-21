import 'dotenv/config';

async function main() {
  const workspaceId = 'browser-test-' + Date.now();
  const baseUrl = 'http://localhost:5186/api/v1';
  const headers = { 'Content-Type': 'application/json', 'X-Workspace-Id': workspaceId };
  
  // 1. Create Profile
  console.log('1. Creating Profile...');
  await fetch(`${baseUrl}/candidates/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      fullName: 'John Doe',
      headline: 'Software Engineer',
      summary: 'Experienced Software Engineer with 5 years in Python, React, and SQL.',
      email: 'john@example.com',
      skills: ['Python', 'React', 'SQL', 'JavaScript', 'Node.js'],
      education: [{ institution: 'University of Technology', degree: 'BSc Computer Science', dates: '2015-2019' }],
      experience: [{ company: 'Tech Corp', title: 'Software Engineer', dates: '2019-2024', description: 'Developed web apps' }]
    })
  });
  
  // 2. Create Job
  console.log('2. Creating Job...');
  const createRes = await fetch(`${baseUrl}/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sourceType: 'TEXT',
      content: 'We are looking for a Senior Software Engineer with strong Python and React skills, and deep knowledge of SQL databases. 3+ years experience required.',
      title: 'Senior Software Engineer'
    })
  });
  const createData = await createRes.json();
  const jobId = createData.job.id;
  
  // 3. Analyze Job
  console.log('3. Analyzing Job...');
  const analyzeRes = await fetch(`${baseUrl}/jobs/${jobId}/analyze`, { method: 'POST', headers });
  console.log('Analyze Status:', analyzeRes.status);
  
  // 4. Match Job
  console.log('4. Matching Job...');
  const matchRes = await fetch(`${baseUrl}/jobs/${jobId}/match`, { method: 'POST', headers });
  console.log('Match Status:', matchRes.status);
  
  // 5. Generate Suggestions
  console.log('5. Fetching Suggestions...');
  const suggRes = await fetch(`${baseUrl}/jobs/${jobId}/suggestions`, { method: 'GET', headers });
  const suggData = await suggRes.json();
  console.log('Suggestions fetched:', suggData.suggestions?.length);
  
  // 6. Approve Suggestion
  console.log('6. Approving Suggestion...');
  if (suggData.suggestions && suggData.suggestions.length > 0) {
    const suggId = suggData.suggestions[0].id;
    await fetch(`${baseUrl}/jobs/${jobId}/suggestions/${suggId}/approve`, { method: 'POST', headers });
  }
  
  // 7. Generate Resume
  console.log('7. Generating Resume...');
  const resRes = await fetch(`${baseUrl}/generation/resume`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jobId, templateId: 'ats' })
  });
  console.log('Resume Status:', resRes.status);
}

main();
