const content = '\n\n```json\n{\n  "test": 1\n}\n```\n';
const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
console.log(match ? match[1] : 'No match');
