import { escapeHtml } from '../utils.js';

export function renderCoverLetter(data, templateName) {
  const name = escapeHtml(data.sender?.name || 'Applicant');
  const email = escapeHtml(data.sender?.email || '');
  const phone = escapeHtml(data.sender?.phone || '');
  const location = escapeHtml(data.sender?.location || '');
  
  const recipientName = escapeHtml(data.recipient?.name || '');
  const recipientCompany = escapeHtml(data.recipient?.company || '');
  
  const dateStr = escapeHtml(data.date);
  
  const greeting = escapeHtml(data.greeting);
  const opening = escapeHtml(data.openingParagraph);
  const bodyPars = (data.bodyParagraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
  const closing = escapeHtml(data.closingParagraph);
  const signOff = escapeHtml(data.signOff);

  if (templateName === 'CL-2') {
    // CL-2: Geometric Green/Teal Corners
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0;
          font-family: 'Century Gothic', 'Tw Cen MT', sans-serif;
          color: #333;
          line-height: 1.6;
          font-size: 11pt;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .document-wrapper {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          overflow: hidden;
          position: relative;
          background: white;
        }
        .corner-top {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 60mm;
          background: linear-gradient(135deg, #e0f2ec 0%, #e0f2ec 50%, transparent 50.1%);
          z-index: 1;
        }
        .corner-bottom {
          position: absolute;
          bottom: 0; right: 0; width: 100%; height: 60mm;
          background: linear-gradient(-45deg, #e0f2ec 0%, #e0f2ec 50%, transparent 50.1%);
          z-index: 1;
        }
        .content {
          position: relative;
          z-index: 2;
          padding: 15mm 20mm;
          height: 100%;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20mm;
        }
        .sender-name {
          font-size: 28pt;
          font-weight: bold;
          color: #064e3b;
          text-transform: uppercase;
          line-height: 1.1;
          margin-bottom: 2mm;
        }
        .sender-title {
          font-size: 14pt;
          color: #0f766e;
        }
        .contact-info {
          text-align: right;
          font-size: 9.5pt;
          color: #333;
        }
        .contact-info div { margin-bottom: 1mm; }
        
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10mm;
          font-weight: bold;
        }
        .recipient {
          font-weight: bold;
        }
        
        .letter-body {
          text-align: justify;
          margin-top: 5mm;
        }
        .letter-body p { margin-bottom: 5mm; }
        
        .sign-off-block { margin-top: 15mm; }
        .signature { font-weight: bold; margin-top: 5mm; font-size: 12pt; }
        .footer-line {
          width: 50mm;
          height: 2px;
          background: #0f766e;
          margin-top: 15mm;
        }
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="corner-top"></div>
        <div class="corner-bottom"></div>
        <div class="content">
          <div class="header">
            <div>
              <div class="sender-name">${name}</div>
              <div class="sender-title">Professional</div>
            </div>
            <div class="contact-info">
              <div>${phone}</div>
              <div>${email}</div>
              <div>${location}</div>
            </div>
          </div>
          
          <div class="meta-row">
            <div class="recipient">
              <div>${recipientName}</div>
              <div>${recipientCompany}</div>
            </div>
            <div>${dateStr}</div>
          </div>
          
          <div class="letter-body">
            <p>${greeting}</p>
            <p>${opening}</p>
            ${bodyPars}
            <p>${closing}</p>
          </div>
          
          <div class="sign-off-block">
            <div>${signOff}</div>
            <div class="signature">${name}</div>
            <div class="footer-line"></div>
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  if (templateName === 'CL-3') {
    // CL-3: Solid Yellow Border
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
          color: #000;
          line-height: 1.6;
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
          background: white;
          border: 12mm solid #fbbf24; /* Yellow border */
          padding: 15mm;
        }
        .title {
          text-align: center;
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 12mm;
        }
        
        .contact-block { margin-bottom: 8mm; }
        .contact-block div { margin-bottom: 1mm; }
        
        .recipient-block { margin-bottom: 10mm; font-weight: bold; }
        .recipient-block div { margin-bottom: 1mm; }
        
        .letter-body { text-align: justify; }
        .letter-body p { margin-bottom: 5mm; }
        
        .sign-off-block { margin-top: 15mm; }
        .signature { font-weight: bold; margin-top: 5mm; }
        
        .footer {
          position: absolute;
          bottom: 15mm;
          right: 18mm;
          font-size: 8pt;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="title">Cover Letter</div>
        
        <div class="contact-block">
          <div>[${name}]</div>
          <div>[${location}]</div>
          <div>[${email}]</div>
          <div>[${phone}]</div>
          <div>[${dateStr}]</div>
        </div>
        
        <div class="recipient-block">
          <div>[${recipientName}]</div>
          <div>[${recipientCompany}]</div>
        </div>
        
        <div class="letter-body">
          <p>${greeting}</p>
          <p>${opening}</p>
          ${bodyPars}
          <p>${closing}</p>
        </div>
        
        <div class="sign-off-block">
          <div>Best Regards,</div>
          <div class="signature">[${name}]</div>
        </div>
        
      </div>
    </body>
    </html>`;
  }

  if (templateName === 'CL-4') {
    // CL-4: Dark Teal Graphic Top Left, Light Grey background
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
          line-height: 1.6;
          font-size: 10.5pt;
          background: #f3f4f6; /* Light Grey background */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .document-wrapper {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          overflow: hidden;
          position: relative;
        }
        .header-graphic {
          position: absolute;
          top: 0; left: 0;
          width: 140mm; height: 65mm;
          background: #0f766e; /* Dark Teal */
          border-bottom-right-radius: 60mm 65mm;
          padding: 15mm;
          color: white;
          z-index: 1;
        }
        .header-graphic h1 {
          font-size: 36pt;
          margin: 0;
          line-height: 1.1;
        }
        
        .main-paper {
          position: absolute;
          top: 45mm;
          right: 15mm;
          width: 130mm;
          height: 235mm;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 2;
          padding: 15mm;
        }
        
        .side-labels {
          position: absolute;
          top: 75mm;
          left: 15mm;
          width: 45mm;
          z-index: 2;
          font-weight: bold;
          font-size: 9pt;
          color: #333;
        }
        
        .contact-block { margin-bottom: 8mm; font-size: 9.5pt; }
        .contact-block div { margin-bottom: 1mm; }
        
        .recipient-block { margin-bottom: 10mm; font-size: 9.5pt; }
        .recipient-block div { margin-bottom: 1mm; }
        
        .letter-body { text-align: justify; font-size: 9.5pt; }
        .letter-body p { margin-bottom: 5mm; }
        
        .sign-off-block { margin-top: 10mm; font-size: 9.5pt; }
        
      </style>
    </head>
    <body>
      <div class="document-wrapper">
        <div class="header-graphic">
          <h1>Cover Letter<br/>Format</h1>
        </div>
        
        <div class="side-labels">
          <div style="margin-bottom: 25mm; border-bottom: 2px solid #0f766e; padding-bottom:2mm;">Header</div>
          <div style="margin-bottom: 15mm; border-bottom: 2px solid #0f766e; padding-bottom:2mm;">Salutation</div>
          <div style="margin-bottom: 22mm; border-bottom: 2px solid #0f766e; padding-bottom:2mm;">Opening</div>
          <div style="margin-bottom: 45mm; border-bottom: 2px solid #0f766e; padding-bottom:2mm;">Body paragraph</div>
        </div>
        
        <div class="main-paper">
          <div class="contact-block">
            <div>${name}</div>
            <div>${location}</div>
            <div>${phone}</div>
            <div>${email}</div>
          </div>
          
          <div style="margin-bottom: 5mm">${dateStr}</div>
          
          <div class="recipient-block">
            <div>${recipientName}</div>
            <div>Hiring Manager</div>
            <div>${recipientCompany}</div>
          </div>
          
          <div class="letter-body">
            <p>${greeting}</p>
            <p>${opening}</p>
            ${bodyPars}
            <p>${closing}</p>
          </div>
          
          <div class="sign-off-block">
            <div>${signOff}</div>
            <div style="margin-top: 2mm">${name}</div>
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  // Fallback: CL-1 style (Clean left-aligned, horizontal rules)
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0; padding: 0;
        font-family: Georgia, serif;
        color: #111827;
        line-height: 1.6;
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
        margin: 0 auto;
        padding: 25mm 20mm;
      }
      .header-section { margin-bottom: 15mm; border-bottom: 2px solid #333; padding-bottom: 6mm; border-top: 2px solid #333; padding-top: 6mm;}
      .sender-name { font-size: 26pt; font-weight: bold; margin-bottom: 2mm; text-transform: uppercase; letter-spacing: 1px; }
      .sender-contact { color: #4b5563; font-size: 9.5pt; font-family: Arial, sans-serif; }
      
      .meta-block { margin-bottom: 12mm; }
      .meta-line { margin-bottom: 1mm; }
      
      .letter-body { text-align: justify; }
      .letter-body p { margin-bottom: 6mm; }
      
      .sign-off { margin-top: 15mm; }
      .signature { font-weight: bold; margin-top: 6mm; font-size: 12pt; }
    </style>
  </head>
  <body>
    <div class="document-wrapper">
      <div class="header-section">
        <div class="sender-name">${name}</div>
        <div class="sender-contact">
          ${[email, phone, location].filter(Boolean).join(' | ')}
        </div>
      </div>
      
      <div class="meta-block">
        <div class="meta-line">${dateStr}</div>
        <div style="height: 6mm;"></div>
        ${[recipientName, recipientCompany].filter(Boolean).map(l => `<div class="meta-line">${l}</div>`).join('')}
      </div>
      
      ${data.subject ? `<div style="font-weight:bold; margin-bottom: 8mm;">Subject: ${escapeHtml(data.subject)}</div>` : ''}

      <div class="letter-body">
        <p>${greeting}</p>
        <p>${opening}</p>
        ${bodyPars}
        <p>${closing}</p>
      </div>

      <div class="sign-off">
        <div>${signOff}</div>
        <div class="signature">${name}</div>
      </div>
    </div>
  </body>
  </html>`;
}
