# API contract

Base path: `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Candidate

- `GET /candidate/profile`
- `PUT /candidate/profile`
- `POST /candidate/resume-upload`

## Jobs

- `POST /jobs`
- `GET /jobs/:id`
- `POST /jobs/:id/analyze`

### Job input contract

```json
{
  "sourceType": "TEXT",
  "content": "Full job advertisement..."
}
```

or

```json
{
  "sourceType": "URL",
  "content": "https://example.com/job"
}
```

The frontend never sends `jobAdvertisement`, `jobAd`, or a second field name for the same concept.

## Match

- `POST /jobs/:id/match`

## Suggestions

- `GET /jobs/:id/suggestions`
- `POST /jobs/:id/suggestions/:suggestionId/approve`

## Generation

- `POST /jobs/:id/generate/resume`
- `POST /jobs/:id/generate/cover-letter`
- `GET /documents/:id`
- `POST /documents/:id/export/pdf`
