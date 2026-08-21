# QA checklist

## Frontend

- [ ] Buttons are actual `<button>` elements or accessible links.
- [ ] Inputs have labels and validation.
- [ ] Mobile layout works at narrow widths.
- [ ] Loading states and errors are visible.
- [ ] Copy action reports success/failure.
- [ ] Download action returns a real PDF.

## Auth

- [ ] Register works.
- [ ] Login works.
- [ ] Protected routes reject unauthenticated users.
- [ ] Logout invalidates the refresh/session token.

## CV input

- [ ] Manual profile saves.
- [ ] PDF upload parses text.
- [ ] DOCX upload parses text.
- [ ] Review step shows extracted data before approval.

## Job input

- [ ] TEXT source accepts valid non-empty job ads.
- [ ] URL source accepts public HTTP(S) URLs.
- [ ] Invalid URLs are rejected before AI call.
- [ ] Unreachable/private/blocked URL gets a clear error.
- [ ] The exact same `content + sourceType` contract reaches the server.

## Analysis

- [ ] AI output passes schema validation.
- [ ] Required skills/experience/education are displayed.
- [ ] No fabricated requirements appear without evidence.
- [ ] 0/0 skills does not produce an inflated score.

## Generation

- [ ] ATS template is machine-readable.
- [ ] Simple template is clean and professional.
- [ ] Europass-inspired template is visually structured.
- [ ] Resume uses candidate evidence only.
- [ ] Cover letter references the target job without inventing company facts.
- [ ] PDF export is readable and paginated.
