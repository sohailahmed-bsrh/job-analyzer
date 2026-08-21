import { escapeHtml, parseSkills } from '../utils.js';

export function renderProfessional(data, templateName) {
  
  if (templateName === 'PRO-2') {
    const photoHtml = data.photoUrl ? `
      <div class="photo-wrapper-pro2">
        <img src="${data.photoUrl}" alt="Profile" />
      </div>
    ` : '';
    
    const skills = parseSkills(data.skills);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          line-height: 1.5;
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
          display: flex;
          flex-direction: column;
        }
        .top-header {
          background: #276282; /* Solid Blue Header */
          color: white;
          text-align: center;
          padding: 15mm 0;
        }
        .top-header h1 {
          margin: 0;
          font-size: 26pt;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 300;
        }
        .top-header h2 {
          margin: 2mm 0 0 0;
          font-size: 11pt;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 300;
        }
        .content-area {
          display: grid;
          grid-template-columns: 85mm 1fr;
          flex: 1;
        }
        .left-col {
          padding: 10mm;
          border-right: 1px solid #e2e8f0;
        }
        .right-col {
          padding: 10mm;
        }
        
        .photo-wrapper-pro2 {
          display: flex;
          justify-content: center;
          margin-top: -25mm; /* overlaps the header */
          margin-bottom: 5mm;
        }
        .photo-wrapper-pro2 img {
          width: 35mm;
          height: 35mm;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          object-fit: cover;
        }
        
        .section-title {
          text-align: center;
          font-size: 11pt;
          color: #276282;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 4mm;
          font-weight: 600;
        }
        .section-title.left {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-title.left::before, .section-title.left::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #276282;
          margin: 0 2mm;
        }
        
        .section-title.right {
          text-align: left;
          border-bottom: 1px solid #276282;
          padding-bottom: 2mm;
        }
        
        .summary { text-align: center; margin-bottom: 10mm; font-size: 9pt; }
        
        .entry { margin-bottom: 6mm; }
        .entry-title { font-weight: bold; font-size: 10pt; }
        .entry-subtitle { font-size: 9.5pt; margin-bottom: 1mm; font-weight: bold;}
        .entry-date { color: #666; font-size: 9pt; margin-bottom: 2mm; }
        .entry-bullets { margin: 0; padding-left: 4mm; font-size: 9pt;}
        
        .skills-container { margin-bottom: 10mm; }
        .skill-bar-row {
          display: flex;
          align-items: center;
          margin-bottom: 2mm;
        }
        .skill-name { width: 35mm; font-size: 8.5pt; text-align: right; margin-right: 3mm; }
        .skill-bar-bg { flex: 1; background: #e2e8f0; height: 3px; position: relative; }
        .skill-bar-fill { background: #276282; height: 100%; width: 80%; }
        
        .contact-block { display: grid; grid-template-columns: 20mm 1fr; row-gap: 2mm; margin-bottom: 10mm; font-size: 9pt;}
        .contact-label { font-weight: bold; color: #666; }
        
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="top-header">
          <h1>${escapeHtml(data.header?.fullName)}</h1>
          <h2>${escapeHtml(data.header?.title)}</h2>
        </div>
        
        <div class="content-area">
          <div class="left-col">
            ${photoHtml}
            
            <div class="section-title left">SUMMARY</div>
            <div class="summary">${escapeHtml(data.summary)}</div>
            
            <div class="section-title left">EDUCATION</div>
            ${(data.education || []).map(edu => `
              <div class="entry" style="text-align: right;">
                <div class="entry-date">${escapeHtml(edu.dates)}</div>
                <div class="entry-title">${escapeHtml(edu.degree)}</div>
                <div class="entry-subtitle">${escapeHtml(edu.institution)}</div>
              </div>
            `).join('')}
            
            <div class="section-title left">RELEVANT SKILLS</div>
            <div class="skills-container">
              ${skills.map(s => `
                <div class="skill-bar-row">
                  <div class="skill-name">${escapeHtml(s)}</div>
                  <div class="skill-bar-bg"><div class="skill-bar-fill"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="right-col">
            <div class="section-title right">CONTACT</div>
            <div class="contact-block">
              <div class="contact-label">phone</div><div>${escapeHtml(data.header?.phone)}</div>
              <div class="contact-label">email</div><div>${escapeHtml(data.header?.email)}</div>
              <div class="contact-label">address</div><div>${escapeHtml(data.header?.location)}</div>
              ${data.header?.linkedin ? `<div class="contact-label">linkedin</div><div>${escapeHtml(data.header.linkedin)}</div>` : ''}
            </div>
            
            <div class="section-title right">PROFESSIONAL EXPERIENCE</div>
            ${(data.experience || []).map(exp => `
              <div class="entry">
                <div class="entry-date">${escapeHtml(exp.dates)}</div>
                <div class="entry-title">${escapeHtml(exp.title)}</div>
                <div class="entry-subtitle">${escapeHtml(exp.company)}</div>
                <ul class="entry-bullets">
                  ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  if (templateName === 'PRO-3') {
    const photoHtml = data.photoUrl ? `
      <div class="photo-wrapper-pro3">
        <img src="${data.photoUrl}" alt="Profile" />
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.5;
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
          display: grid;
          grid-template-columns: 80mm 1fr;
        }
        .sidebar {
          background: #4bb3c1; /* Bright Teal */
          color: white;
          padding: 15mm 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .main-content {
          padding: 15mm;
          background: white;
        }
        
        .photo-wrapper-pro3 img {
          width: 45mm;
          height: 45mm;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          margin-bottom: 5mm;
        }
        
        .name-block { text-align: center; margin-bottom: 10mm; width: 100%; }
        .name-block h1 { font-size: 24pt; margin: 0; font-weight: bold; }
        .name-block h2 { font-size: 14pt; margin: 2mm 0 0 0; font-weight: 300; }
        
        .sidebar-section { width: 100%; margin-bottom: 10mm; }
        .sidebar-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          border-top: 1px solid rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.5);
          padding: 2mm 0;
          margin-bottom: 4mm;
        }
        .sidebar-text { padding: 0 10mm; text-align: justify; font-size: 9pt; }
        .contact-item { margin-bottom: 4mm; padding: 0 10mm; }
        .contact-label { font-weight: bold; font-size: 9pt; margin-bottom: 1mm; }
        
        .main-section-title {
          background: #4bb3c1;
          color: white;
          text-align: center;
          font-weight: bold;
          font-size: 14pt;
          padding: 3mm;
          margin-bottom: 6mm;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 2mm 5mm;
          margin-bottom: 10mm;
          padding: 0 5mm;
        }
        .skill-item { display: flex; align-items: center; width: 45%; }
        .skill-item::before { content: "•"; margin-right: 2mm; color: #333; font-size: 14pt; line-height: 1; }
        
        .entry { margin-bottom: 6mm; padding: 0 5mm; }
        .entry-title { font-weight: bold; font-size: 11pt; color: #2d3748; }
        .entry-subtitle { font-size: 9.5pt; color: #718096; margin-bottom: 2mm; }
        .entry-bullets { margin: 0; padding-left: 5mm; }
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="sidebar">
          ${photoHtml}
          <div class="name-block">
            <h1>${escapeHtml(data.header?.fullName)}</h1>
            <h2>${escapeHtml(data.header?.title)}</h2>
          </div>
          
          <div class="sidebar-section">
            <div class="sidebar-title">About Me</div>
            <div class="sidebar-text">${escapeHtml(data.summary)}</div>
          </div>
          
          <div class="sidebar-section">
            <div class="sidebar-title">Contact</div>
            <div class="contact-item">
              <div class="contact-label">Phone</div>
              <div>${escapeHtml(data.header?.phone)}</div>
            </div>
            <div class="contact-item">
              <div class="contact-label">Email</div>
              <div>${escapeHtml(data.header?.email)}</div>
            </div>
            <div class="contact-item">
              <div class="contact-label">Address</div>
              <div>${escapeHtml(data.header?.location)}</div>
            </div>
            ${data.header?.linkedin ? `
            <div class="contact-item">
              <div class="contact-label">LinkedIn</div>
              <div>${escapeHtml(data.header.linkedin)}</div>
            </div>` : ''}
          </div>
        </div>
        
        <div class="main-content">
          <div class="main-section-title">Skills</div>
          <div class="skills-list">
            ${parseSkills(data.skills).map(s => `<div class="skill-item">${escapeHtml(s)}</div>`).join('')}
          </div>
          
          <div class="main-section-title">Work Experience</div>
          ${(data.experience || []).map(exp => `
            <div class="entry">
              <div class="entry-title">${escapeHtml(exp.title)}</div>
              <div class="entry-subtitle">${escapeHtml(exp.company)}, ${escapeHtml(exp.location)} | ${escapeHtml(exp.dates)}</div>
              <ul class="entry-bullets">
                ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
          
          <div class="main-section-title">Education</div>
          ${(data.education || []).map(edu => `
            <div class="entry">
              <div class="entry-title">${escapeHtml(edu.degree)}</div>
              <div class="entry-subtitle">${escapeHtml(edu.institution)}, ${escapeHtml(edu.location)} | ${escapeHtml(edu.dates)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>`;
  }

  // Fallback: PRO-1 style (Dark Sidebar on Left)
  const photoHtml = data.photoUrl ? `
    <div class="photo-wrapper">
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
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #333333;
        line-height: 1.5;
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
        display: grid;
        grid-template-columns: 75mm 1fr;
      }
      
      .sidebar {
        background: #232c39; /* Dark Slate */
        color: #ffffff;
        padding: 15mm 10mm;
      }
      
      .main-content {
        padding: 15mm;
        background: #ffffff;
      }
      
      .photo-wrapper {
        display: flex;
        justify-content: center;
        margin-bottom: 10mm;
      }
      .profile-photo {
        width: 40mm;
        height: 40mm;
        border-radius: 50%;
        border: 4px solid #a3b8cc;
        object-fit: cover;
      }
      
      .sidebar-title {
        color: #ffffff;
        font-size: 13pt;
        border-bottom: 2px solid #a3b8cc;
        padding-bottom: 2mm;
        margin-bottom: 4mm;
        font-weight: 600;
      }
      .contact-block { margin-bottom: 8mm; }
      .contact-item { margin-bottom: 3mm; display: flex; flex-direction: column; }
      .contact-label { font-size: 8pt; font-weight: bold; color: #a3b8cc; margin-bottom: 1mm; }
      .contact-text { font-size: 8.5pt; word-break: break-all; }
      
      .skills-list { display: flex; flex-direction: column; gap: 2mm; margin-bottom: 8mm; }
      .skill-item { font-size: 8.5pt; display: flex; align-items: center; }
      .skill-item::before { content: "•"; color: #a3b8cc; margin-right: 2mm; font-size: 14pt; line-height: 1; }
      
      .name-block { margin-bottom: 10mm; }
      .name-block h1 { margin: 0; font-size: 28pt; color: #1a202c; font-weight: 800; text-transform: uppercase; line-height: 1.1; }
      .name-block h2 { margin: 2mm 0 0 0; font-size: 14pt; color: #4a5568; font-weight: 500; }
      
      .section-heading {
        color: #1a202c;
        font-size: 15pt;
        font-weight: 700;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 2mm;
        margin-bottom: 4mm;
      }
      .summary { margin-bottom: 8mm; text-align: justify; }
      
      .entry { margin-bottom: 6mm; page-break-inside: avoid; }
      .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
      .entry-title { font-weight: 700; font-size: 11pt; color: #1a202c; }
      .entry-dates { font-weight: 600; font-size: 9pt; color: #4a5568; }
      .entry-subtitle { font-style: italic; color: #718096; margin-bottom: 2mm; font-size: 9.5pt; }
      .entry-bullets { margin: 0; padding-left: 5mm; }
      .entry-bullets li { margin-bottom: 1mm; color: #2d3748; }
    </style>
  </head>
  <body>
    <div class="document-wrapper">
      <div class="sidebar">
        ${photoHtml}
        
        <div class="contact-block">
          <div class="sidebar-title">Contact</div>
          <div class="contact-item">
            <span class="contact-label">Address</span>
            <span class="contact-text">${escapeHtml(data.header?.location)}</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">Phone</span>
            <span class="contact-text">${escapeHtml(data.header?.phone)}</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">Email</span>
            <span class="contact-text">${escapeHtml(data.header?.email)}</span>
          </div>
          ${data.header?.linkedin ? `
          <div class="contact-item">
            <span class="contact-label">LinkedIn</span>
            <span class="contact-text">${escapeHtml(data.header.linkedin)}</span>
          </div>` : ''}
        </div>
        
        <div class="skills-block">
          <div class="sidebar-title">Skills</div>
          <div class="skills-list">
            ${parseSkills(data.skills).map(s => `<div class="skill-item">${escapeHtml(s)}</div>`).join('')}
          </div>
        </div>
        
        ${data.languages && data.languages.length ? `
        <div class="langs-block">
          <div class="sidebar-title">Languages</div>
          <div class="skills-list">
            ${data.languages.map(l => `<div class="skill-item">${escapeHtml(l)}</div>`).join('')}
          </div>
        </div>` : ''}
      </div>
      
      <div class="main-content">
        <div class="name-block">
          <h1>${escapeHtml(data.header?.fullName)}</h1>
          <h2>${escapeHtml(data.header?.title)}</h2>
        </div>
        
        <div class="section-heading">Profile</div>
        <div class="summary">${escapeHtml(data.summary)}</div>
        
        <div class="section-heading">Work Experience</div>
        ${(data.experience || []).map(exp => `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-title">${escapeHtml(exp.title)}</div>
              <div class="entry-dates">${escapeHtml(exp.dates)}</div>
            </div>
            <div class="entry-subtitle">${escapeHtml(exp.company)} - ${escapeHtml(exp.location)}</div>
            <ul class="entry-bullets">
              ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
        
        <div class="section-heading">Education</div>
        ${(data.education || []).map(edu => `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-title">${escapeHtml(edu.degree)}</div>
              <div class="entry-dates">${escapeHtml(edu.dates)}</div>
            </div>
            <div class="entry-subtitle">${escapeHtml(edu.institution)} - ${escapeHtml(edu.location)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </body>
  </html>`;
}
