import { z } from 'zod';
import { renderResume } from './server/src/modules/documents/renderers.js';
import { resumeOutputSchema } from './server/src/modules/generation/generation.schemas.js';

const mockAiResponse = {
  header: { fullName: 'Test Name', title: 'Test Title' },
  summary: 'Test summary',
  skills: [],
  experience: [],
  education: []
};

// Simulate Zod parse
const parsed = resumeOutputSchema.parse(mockAiResponse);

// Simulate what generation.service.js does
parsed.photoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const html = renderResume(parsed, 'PRO-2');
console.log('Includes photo?', html.includes('<img src="data:image/png;base64,'));
