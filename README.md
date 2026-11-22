<div align="center">

<h1>Job Analyzer & ATS Resume Optimization Suite</h1>

<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=22&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=800&lines=Automated+Resume+Parsing+%26+ATS+Scoring;Semantic+Skill+Gap+Analysis;Tailored+Cover+Letter+Synthesis;Full-Stack+Node.js+%2B+React+Architecture" alt="Typing Header" />

<p><strong>Applicant Tracking System (ATS) Analysis Engine and Document Generation Platform</strong></p>

<p>
  <a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=nodejs,express,react,tailwind,js,sqlite,prisma,github&theme=dark" alt="Skills" /></a>
</p>

</div>

---

## Executive Summary

Job Analyzer is a full-stack recruitment intelligence platform designed to parse candidate resumes, extract key technical competencies, compare qualification profiles against job descriptions, and generate quantitative ATS match scores. The platform includes an automated cover letter synthesis module and multi-template PDF compilation engine.

---

## Application Interface & Visual Analytics Gallery

<table align="center">
  <tr>
    <td align="center"><b>Candidate Dashboard & Document Manager</b><br><sub>Centralized management of resumes, candidate profiles, and target roles.</sub></td>
    <td align="center"><b>ATS Keyword Extraction & Match Analytics</b><br><sub>Quantitative matching evaluation highlighting qualification alignment.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/1.png" alt="Dashboard Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/4.png" alt="Analysis Screen" width="460"/></td>
  </tr>
  <tr>
    <td align="center"><b>Targeted Cover Letter Generation Studio</b><br><sub>Automated composition emphasizing relevant professional experience.</sub></td>
    <td align="center"><b>Skill Gap Breakdown & Recommendations</b><br><sub>Detailed skill audit isolating missing technical competencies.</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="SCREENSHOTS/6.png" alt="Cover Letter Screen" width="460"/></td>
    <td align="center"><img src="SCREENSHOTS/10.png" alt="Recommendations Screen" width="460"/></td>
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

## Core Engineering Features

- **Document Parsing Engine**: Multi-format document parser extracting structured text, work history, and educational credentials from unstructured PDF and DOCX files.
- **ATS Match Scoring Algorithm**: Evaluates candidate skill sets against job posting requirements using weighted keyword frequency, semantic context, and technical relevance.
- **Automated Document Synthesis**: Formulates tailored, professional cover letters aligned to target role requirements.
- **Headless PDF Compilation**: Playwright-driven PDF rendering service generating formatted, ATS-compliant documents.

---

## Repository Structure

```
job-analyzer/
|-- client/
|   |-- src/
|   +-- package.json
|-- server/
|   |-- prisma/
|   |-- src/
|   |   |-- modules/
|   |   |   |-- candidate/
|   |   |   |-- documents/
|   |   |   |-- generation/
|   |   |   +-- jobs/
|   |   +-- server.js
|   +-- package.json
|-- SCREENSHOTS/
|   |-- 1.png
|   |-- 4.png
|   |-- 6.png
|   +-- 10.png
|-- package.json
+-- README.md
```

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

# Install root, client, and server dependencies
npm run install:all

# Run database migrations
npm run prisma:migrate

# Start application
npm run dev
```

---

## Author & License

- **Author**: Sohail Ahmed ([Portfolio](https://sohail.devsil.com) | [GitHub](https://github.com/sohailahmed-bsrh))
- **License**: Distributed under the MIT License.
