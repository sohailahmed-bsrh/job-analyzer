import fetch from 'node-fetch';

async function main() {
  console.log('Testing E2E Job Analysis API on running server...');
  try {
    const res = await fetch('http://localhost:5186/api/v1/jobs/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': 'default' },
      body: JSON.stringify({
        jobUrl: '',
        jobDescription: 'Software Engineer required. Must know Python, React, and SQL. 3 years experience. Bachelor\'s degree preferred.'
      })
    });
    const text = await res.text();
    console.log('API Response Status:', res.status);
    console.log('API Response Text:', text);
  } catch (err) {
    console.error('Error pining server:', err);
  }
}

main();
