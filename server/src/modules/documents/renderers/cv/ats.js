import { escapeHtml, parseSkills } from '../utils.js';

export function renderAts(data, templateName) {
  const isATS1 = templateName === 'ATS-1';
  
  if (isATS1) {
    // ATS-1 looks like a 2-column Europass layout based on the sample image
    const photoHtml = data.photoUrl ? `
      <div class="photo-wrap">
        <img src="${data.photoUrl}" alt="Profile Photo" class="profile-photo" />
      </div>
    ` : '<div class="photo-wrap"></div>';

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0;
          font-family: 'Open Sans', 'Segoe UI', Tahoma, sans-serif;
          color: #333333;
          line-height: 1.4;
          font-size: 9pt;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .document-wrapper {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          overflow: hidden;
          background: white;
          display: grid;
          grid-template-columns: 65mm 1fr;
        }
        .sidebar {
          background: #f0f0f0;
          padding: 15mm 10mm;
        }
        .main-content {
          padding: 15mm 15mm;
          position: relative;
        }
        
        .photo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 8mm;
        }
        .profile-photo {
          width: 35mm;
          height: 35mm;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #ccc;
        }
        .name {
          font-size: 20pt;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          margin-bottom: 8mm;
        }
        .contact-group { margin-bottom: 4mm; }
        .contact-label { font-weight: bold; color: #4a5568; margin-bottom: 1mm; font-size: 8.5pt; display: block; }
        .contact-val { color: #333; font-size: 8pt; word-break: break-all; }
        
        .europass-logo {
          position: absolute;
          top: 8mm;
          right: 15mm;
          height: 8mm;
          width: auto;
          background-color: #0f3083; /* Simulated Europass logo blue box */
          color: white;
          padding: 2px 8px;
          border-radius: 2px;
          font-weight: bold;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
        }
        .europass-logo span { color: #1e3a8a; margin-left: 8px; font-weight: normal; font-size: 14pt; background: transparent; letter-spacing: -1px; }
        
        .section-title {
          font-size: 11pt;
          text-transform: uppercase;
          color: #4a5568;
          margin-bottom: 4mm;
          letter-spacing: 0.5px;
        }
        .summary { margin-bottom: 6mm; color: #333; }
        
        .timeline-section { position: relative; margin-bottom: 6mm; }
        .timeline-item {
          position: relative;
          padding-left: 6mm;
          margin-bottom: 4mm;
          border-left: 2px solid #2b6cb0;
        }
        .timeline-item::before {
          content: "";
          position: absolute;
          left: -4.5px;
          top: 2px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2b6cb0;
        }
        .dates { font-weight: bold; color: #2b6cb0; font-size: 8.5pt; margin-bottom: 1mm; }
        .item-title { font-weight: bold; font-size: 10pt; color: #333; }
        .item-subtitle { color: #666; font-size: 9pt; margin-bottom: 1mm; }
        .bullets { padding-left: 4mm; margin-top: 1mm; margin-bottom: 0; color: #444; }
        .bullets li { margin-bottom: 1mm; }
        
        .skills-grid {
          display: flex; flex-wrap: wrap; gap: 4px;
        }
        .skill-badge {
          color: #555;
          font-size: 8.5pt;
        }
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="sidebar">
          ${photoHtml}
          <div class="name">${escapeHtml(data.header?.fullName)}</div>
          
          <div class="contact-group">
            <span class="contact-label">Nationality:</span>
            <span class="contact-val">${escapeHtml(data.header?.location) || 'Unknown'}</span>
          </div>
          <div class="contact-group">
            <span class="contact-label">Phone number:</span>
            <span class="contact-val">${escapeHtml(data.header?.phone)}</span>
          </div>
          <div class="contact-group">
            <span class="contact-label">Email address:</span>
            <span class="contact-val">${escapeHtml(data.header?.email)}</span>
          </div>
          ${data.header?.linkedin ? `
          <div class="contact-group">
            <span class="contact-label">LinkedIn:</span>
            <span class="contact-val">${escapeHtml(data.header.linkedin)}</span>
          </div>
          ` : ''}
          ${data.header?.portfolio ? `
          <div class="contact-group">
            <span class="contact-label">Portfolio:</span>
            <span class="contact-val">${escapeHtml(data.header.portfolio)}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="main-content">
          <div class="europass-logo">★ <span>europass</span></div>
          <div style="height: 12mm"></div> <!-- Spacer for logo -->
          
          <div class="section-title">ABOUT ME:</div>
          <div class="summary">${escapeHtml(data.summary)}</div>
          
          <div class="section-title">WORK EXPERIENCE</div>
          <div class="timeline-section">
            ${(data.experience || []).map(exp => `
              <div class="timeline-item">
                <div class="dates">${escapeHtml(exp.dates)}${exp.location ? ` - ${escapeHtml(exp.location)}` : ''}</div>
                <div class="item-title">${escapeHtml(exp.title)}</div>
                <div class="item-subtitle">${escapeHtml(exp.company)}</div>
                <ul class="bullets">
                  ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          
          <div class="section-title">EDUCATION AND TRAINING</div>
          <div class="timeline-section">
            ${(data.education || []).map(edu => `
              <div class="timeline-item">
                <div class="dates">${escapeHtml(edu.dates)}${edu.location ? ` - ${escapeHtml(edu.location)}` : ''}</div>
                <div class="item-title">${escapeHtml(edu.degree)}</div>
                <div class="item-subtitle">${escapeHtml(edu.institution)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="section-title">DIGITAL SKILLS</div>
          <div class="skills-grid">
            ${parseSkills(data.skills).map(s => `<span class="skill-badge">${escapeHtml(s)} /</span>`).join(' ')}
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  // Default ATS formatting for all other ATS templates (Clean, Single Column, Parsing-focused)
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 0;
        font-family: 'Times New Roman', Times, serif;
        color: #000000;
        line-height: 1.5;
        font-size: 10.5pt;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .document-wrapper {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        overflow: hidden;
        padding: 20mm;
      }
      .header-section {
        text-align: center;
        margin-bottom: 6mm;
        border-bottom: 1px solid #000;
        padding-bottom: 4mm;
      }
      h1 { font-size: 20pt; text-transform: uppercase; margin: 0 0 2mm 0; }
      .contact-info { font-size: 10pt; }
      
      .section { margin-bottom: 6mm; }
      .section-title {
        font-size: 12pt;
        font-weight: bold;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        margin-bottom: 3mm;
        padding-bottom: 1mm;
      }
      
      .item { margin-bottom: 4mm; page-break-inside: avoid; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; }
      .item-subheader { display: flex; justify-content: space-between; font-style: italic; margin-bottom: 1mm; }
      
      .bullets { margin: 0; padding-left: 5mm; }
      .bullets li { margin-bottom: 1mm; }
      
      .skills-list { line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="document-wrapper">
      <div class="header-section">
        <h1>${escapeHtml(data.header?.fullName)}</h1>
        <div class="contact-info">
          ${[data.header?.email, data.header?.phone, data.header?.location, data.header?.linkedin].filter(Boolean).map(escapeHtml).join(' | ')}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div>${escapeHtml(data.summary)}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Professional Experience</div>
        ${(data.experience || []).map(exp => `
          <div class="item">
            <div class="item-header">
              <span>${escapeHtml(exp.title)}</span>
              <span>${escapeHtml(exp.dates)}</span>
            </div>
            <div class="item-subheader">
              <span>${escapeHtml(exp.company)}</span>
              <span>${escapeHtml(exp.location)}</span>
            </div>
            <ul class="bullets">
              ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <div class="section-title">Education</div>
        ${(data.education || []).map(edu => `
          <div class="item">
            <div class="item-header">
              <span>${escapeHtml(edu.degree)}</span>
              <span>${escapeHtml(edu.dates)}</span>
            </div>
            <div class="item-subheader">
              <span>${escapeHtml(edu.institution)}</span>
              <span>${escapeHtml(edu.location)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-list">
          ${parseSkills(data.skills).map(escapeHtml).join(', ')}
        </div>
      </div>
    </div>
  </body>
  </html>`;
}
