<div align="center">

<h1>Job Analyzer & ATS Resume Optimization Suite</h1>

<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=22&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=800&lines=Automated+Resume+Parsing+%26+ATS+Scoring;Semantic+Skill+Gap+Analysis;Tailored+Cover+Letter+Synthesis;Full-Stack+Node.js+%2B+React+Architecture" alt="Typing Header" />

<p><strong>Applicant Tracking System (ATS) Analysis Engine and Document Generation Platform</strong></p>

<p>
  <a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=nodejs,express,react,tailwind,js,sqlite,prisma,github&theme=dark" alt="Skills" /></a>
</p>

<p>
  <a href="#overview">Overview</a> &bull;
  <a href="#system-architecture">Architecture</a> &bull;
  <a href="#visual-showcase-gallery">Visual Gallery</a> &bull;
  <a href="#core-capabilities">Capabilities</a> &bull;
  <a href="#installation--setup">Installation</a> &bull;
  <a href="#author--contact-information">Author</a>
</p>

</div>

---
## Overview

Job Analyzer is a full-stack recruitment intelligence platform designed to parse candidate resumes, extract key technical competencies, compare qualification profiles against job descriptions, and generate quantitative ATS match scores. The platform includes an automated cover letter synthesis module and multi-template PDF compilation engine.

---

## Visual Showcase Gallery

### Application Interface & ATS Scoring
<table width="100%" align="center">
  <tr>
    <td width="50%" align="center"><b>Candidate Dashboard & Document Manager</b><br><sub>Centralized management of resumes, candidate profiles, and target roles.</sub></td>
    <td width="50%" align="center"><b>Job Description Analysis</b><br><sub>Automated extraction of technical requirements and competencies.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/1.png" alt="Dashboard Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/2.png" alt="Job Analysis Screen" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Resume Upload & Entity Extraction</b><br><sub>Ingestion of PDF/DOCX files with structured field parsing.</sub></td>
    <td width="50%" align="center"><b>Quantitative ATS Match Analytics</b><br><sub>Quantitative matching evaluation highlighting qualification alignment.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/3.png" alt="Upload Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/4.png" alt="Match Analytics" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Candidate Profile Editor</b><br><sub>Fine-tuning extracted work history and education records.</sub></td>
    <td width="50%" align="center"><b>Targeted Cover Letter Generation Studio</b><br><sub>Automated composition emphasizing relevant professional experience.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/5.png" alt="Profile Editor" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/6.png" alt="Cover Letter Screen" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Document Template Selector</b><br><sub>Selection between ATS-Friendly, Europass, and Modern styles.</sub></td>
    <td width="50%" align="center"><b>Cover Letter Style Customizer</b><br><sub>Tone parametrization across corporate, executive, and creative formats.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/7.png" alt="Template Selector" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/8.png" alt="Style Customizer" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Interactive Live Document Preview</b><br><sub>Instant visual rendering of formatted resume and letter pages.</sub></td>
    <td width="50%" align="center"><b>Skill Gap Breakdown & Recommendations</b><br><sub>Detailed skill audit isolating missing technical competencies.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/9.png" alt="Preview Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/10.png" alt="Recommendations Screen" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Keyword Optimization Suggestions</b><br><sub>Targeted semantic recommendations for boosting ATS scores.</sub></td>
    <td width="50%" align="center"><b>Multi-Role Tracking Matrix</b><br><sub>Comparative overview of candidate scores across target applications.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/11.png" alt="Keywords Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/12.png" alt="Matrix Screen" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Candidate Experience Timeline</b><br><sub>Chronological work history mapping and duty alignment.</sub></td>
    <td width="50%" align="center"><b>Headless PDF Export Pipeline</b><br><sub>Playwright rendering compiling pixel-perfect PDF documents.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/13.png" alt="Timeline Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/14.png" alt="Export Screen" width="460"/></td>
  </tr>
  <tr>
    <td width="50%" align="center"><b>Export Format Selection</b><br><sub>Options for PDF, DOCX, and raw structured JSON export.</sub></td>
    <td width="50%" align="center"><b>Batch Job Application Management</b><br><sub>Lifecycle tracking from initial drafting to interview scheduling.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/15.png" alt="Format Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/16.png" alt="Application Tracker" width="460"/></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><b>Final Executive Document Review</b><br><sub>Full-screen verification before final client dispatch.</sub></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="SCREENSHOTS/17.png" alt="Final Review" width="650"/></td>
  </tr>
</table>

---

## System Architecture

```mermaid
flowchart TD
    A[Resume File Upload: PDF / DOCX] --> B[Text Extraction & Normalization Engine]
    C[Target Job Description Input] --> D[Job Requirement Parsing & Entity Extraction]
    B --> E[Semantic Vector Alignment & Keyword Comparator]
    D --> E
    E --> F[Quantitative ATS Score Calculation]
    E --> G[Skill Gap Breakdown & Missing Keyword Alert]
    E --> H[Tailored Cover Letter Generation Engine]
    H --> I[Headless Playwright PDF Export Service]
```

---

## Core Capabilities

- **Multi-Format Parsing Engine**: Parses unstructured text, work history, and educational credentials from PDF and DOCX files.
- **ATS Match Scoring Algorithm**: Evaluates candidate skill sets against job posting requirements using weighted keyword frequency and semantic context.
- **Automated Document Synthesis**: Formulates tailored, professional cover letters aligned to target role requirements.
- **Headless PDF Compilation**: Playwright-driven rendering service generating formatted, ATS-compliant documents.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend Server | Node.js, Express, RESTful APIs |
| Database & ORM | SQLite, Prisma ORM |
| Document Rendering | Playwright Headless Browser Service |
| AI Integration | LLM API Clients for Text Processing |

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/sohailahmed-bsrh/job-analyzer.git
cd job-analyzer

# Install dependencies
npm run install:all

# Run database migrations
npm run prisma:migrate

# Start application
npm run dev
```
---

## Author & Contact Information

<table width="100%" align="center">
  <tr>
    <td align="center" style="padding: 20px;">
      <h3>Sohail Ahmed</h3>
      <p><strong>Full-Stack Artificial Intelligence & Computer Vision Engineer</strong></p>
      <p>
        <a href="https://sohail.devsil.com"><img src="https://img.shields.io/badge/Live_Portfolio-sohail.devsil.com-0052FF?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio"/></a>
        <a href="https://github.com/sohailahmed-bsrh"><img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
        <a href="https://linkedin.com/in/sohail-ahmed-dev"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
        <a href="mailto:sohail.bsrh@gmail.com"><img src="https://img.shields.io/badge/Email-Contact_Me-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
      </p>
      <p><em>Available for technical roles in Artificial Intelligence, Computer Vision, and Full-Stack Engineering.</em></p>
      <hr style="border: 0; height: 1px; background: #30363d; margin: 15px 0;">
      <small>Repository: <code>sohailahmed-bsrh/job-analyzer</code> &bull; Distributed under the MIT License.</small>
    </td>
  </tr>
</table>
