# Architecture

## Domain boundaries

### Auth
Owns registration, login, session lifecycle, and access control.

### Candidate
Owns profile data, education, experience, skills, and source documents.

### Jobs
Owns job text/URL, normalized job records, source metadata, and accessibility errors.

### Analysis
Owns AI extraction of job requirements and deterministic candidate/job matching.

### Suggestions
Owns evidence-gap suggestions and approve/add actions.

### Generation
Owns resume and cover-letter generation. AI output is structured and validated before save.

### Documents
Owns template choice, preview payloads, copy text, and PDF export.

## Request pipeline

Browser → REST route → auth middleware → validator → controller → service → provider/repository → response serializer.

No page directly calls Prisma or Gemini.

## Why this structure

A route-specific bug can be traced without searching the whole project:

`frontend/pages/job-analysis` → `frontend/services/jobService.js` → `server/api/routes/job.routes.js` → `job.controller.js` → `job.service.js` → `gemini.provider.js`.
