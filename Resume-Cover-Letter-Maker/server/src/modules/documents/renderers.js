import { renderAts } from './renderers/cv/ats.js';
import { renderEuropass } from './renderers/cv/europass.js';
import { renderProfessional } from './renderers/cv/professional.js';
import { renderCoverLetter as renderCL } from './renderers/cl/coverLetter.js';

export function renderResume(data, templateName) {
  if (templateName.startsWith('ATS')) {
    return renderAts(data, templateName);
  }
  if (templateName.startsWith('EUROPASS')) {
    return renderEuropass(data, templateName);
  }
  if (templateName.startsWith('PRO')) {
    return renderProfessional(data, templateName);
  }
  // Fallback
  return renderAts(data, 'ATS-2');
}

export function renderCoverLetter(data, templateName = 'CL-1') {
  return renderCL(data, templateName);
}
