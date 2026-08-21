import { parseAiResponse } from './src/utils/jsonParser.js';

const aiOutputs = [
  // 1. Clean JSON
  `{"test": true}`,
  
  // 2. Fenced JSON
  `\`\`\`json
{
  "test": true
}
\`\`\``,

  // 3. Fenced JSON with leading/trailing spaces
  `
  \`\`\`json
  {"test": true}
  \`\`\`
  `,

  // 4. Naked markdown fence
  `\`\`\`
{"test": true}
\`\`\``
];

let allPassed = true;

for (let i = 0; i < aiOutputs.length; i++) {
  try {
    const res = parseAiResponse(aiOutputs[i]);
    if (res.test !== true) {
      console.error(`Test ${i + 1} Failed: Value is not true.`);
      allPassed = false;
    } else {
      console.log(`Test ${i + 1} Passed.`);
    }
  } catch (err) {
    console.error(`Test ${i + 1} Failed with error: ${err.message}`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('All JSON parsing tests passed.');
}
