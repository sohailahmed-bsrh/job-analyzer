import { escapeHtml, parseSkills } from '../utils.js';

export function renderEuropass(data, templateName) {
  // Classic Europass layout for Europass 1-4
  const photoHtml = data.photoUrl ? `
    <div class="photo-container">
      <img src="${data.photoUrl}" alt="Profile Photo" class="profile-photo" />
    </div>
  ` : '';

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
        line-height: 1.4;
        font-size: 9.5pt;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .document-wrapper {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        overflow: hidden;
      }
      
      .top-banner {
        background-color: #003399; /* Europass Blue */
        height: 35mm;
        padding: 0 15mm;
        display: flex;
        align-items: center;
      }
      .logo {
        background: #003399;
        color: #fff;
        padding: 4px;
        font-weight: bold;
        font-size: 16pt;
        display: flex; align-items: center; gap: 8px;
        letter-spacing: 1px;
      }
      .logo span { color: #facc15; font-size: 24pt; line-height: 1; }
      
      .main-grid {
        display: grid;
        grid-template-columns: 60mm 1fr;
        height: calc(297mm - 35mm);
      }
      
      .left-col {
        background: #e6f0fa;
        padding: 10mm;
      }
      .right-col {
        padding: 10mm 15mm;
      }
      
      .photo-container {
        display: flex; justify-content: center; margin-bottom: 8mm;
      }
      .profile-photo {
        width: 40mm; height: 40mm; border-radius: 50%; border: 3px solid #fff; object-fit: cover;
      }
      
      .name-block { margin-bottom: 8mm; }
      .name-block h1 { margin: 0; font-size: 22pt; color: #003399; font-weight: normal; }
      .name-block h2 { margin: 2mm 0 0 0; font-size: 12pt; color: #555; font-weight: normal; }
      
      .contact-block { margin-bottom: 6mm; }
      .contact-item { margin-bottom: 2mm; display: flex; align-items: flex-start; gap: 2mm; }
      .contact-icon { width: 4mm; height: 4mm; background: #003399; display: inline-block; flex-shrink: 0; border-radius: 50%; }
      .contact-text { color: #444; font-size: 8.5pt; word-break: break-all; }
      
      .section-heading {
        color: #003399;
        font-size: 14pt;
        border-bottom: 1px solid #003399;
        padding-bottom: 2mm;
        margin-bottom: 4mm;
        font-weight: normal;
        text-transform: uppercase;
      }
      .summary { margin-bottom: 8mm; }
      
      .entry { margin-bottom: 6mm; page-break-inside: avoid; display: grid; grid-template-columns: 30mm 1fr; gap: 4mm; }
      .entry-date { color: #003399; font-weight: bold; font-size: 8.5pt; }
      .entry-main h3 { margin: 0 0 1mm 0; font-size: 11pt; color: #333; }
      .entry-main h4 { margin: 0 0 2mm 0; font-size: 9.5pt; color: #666; font-weight: normal; font-style: italic; }
      .entry-main ul { margin: 0; padding-left: 4mm; }
      .entry-main ul li { margin-bottom: 1mm; font-size: 9pt; }
      
      .skills-container { margin-bottom: 6mm; }
      .skills-container .skill {
        display: inline-block;
        background: #003399;
        color: white;
        padding: 1mm 3mm;
        border-radius: 3mm;
        font-size: 8pt;
        margin: 0 1mm 1mm 0;
      }
    </style>
  </head>
  <body>
    <div class="document-wrapper">
      <div class="top-banner">
        <div class="logo"><span>★</span> europass</div>
      </div>
      <div class="main-grid">
        <div class="left-col">
          ${photoHtml}
          
          <div class="contact-block">
            <div class="contact-item"><div class="contact-icon"></div><div class="contact-text">${escapeHtml(data.header?.location)}</div></div>
            <div class="contact-item"><div class="contact-icon"></div><div class="contact-text">${escapeHtml(data.header?.phone)}</div></div>
            <div class="contact-item"><div class="contact-icon"></div><div class="contact-text">${escapeHtml(data.header?.email)}</div></div>
            ${data.header?.linkedin ? `<div class="contact-item"><div class="contact-icon"></div><div class="contact-text">${escapeHtml(data.header.linkedin)}</div></div>` : ''}
          </div>
        </div>
        
        <div class="right-col">
          <div class="name-block">
            <h1>${escapeHtml(data.header?.fullName)}</h1>
            <h2>${escapeHtml(data.header?.title)}</h2>
          </div>
          
          <div class="section-heading">About Me</div>
          <div class="summary">${escapeHtml(data.summary)}</div>
          
          <div class="section-heading">Work Experience</div>
          ${(data.experience || []).map(exp => `
            <div class="entry">
              <div class="entry-date">${escapeHtml(exp.dates)}</div>
              <div class="entry-main">
                <h3>${escapeHtml(exp.title)}</h3>
                <h4>${escapeHtml(exp.company)} | ${escapeHtml(exp.location)}</h4>
                <ul>${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
              </div>
            </div>
          `).join('')}
          
          <div class="section-heading">Education</div>
          ${(data.education || []).map(edu => `
            <div class="entry">
              <div class="entry-date">${escapeHtml(edu.dates)}</div>
              <div class="entry-main">
                <h3>${escapeHtml(edu.degree)}</h3>
                <h4>${escapeHtml(edu.institution)} | ${escapeHtml(edu.location)}</h4>
              </div>
            </div>
          `).join('')}
          
          <div class="section-heading">Digital Skills</div>
          <div class="skills-container">
            ${parseSkills(data.skills).map(s => `<span class="skill">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}
