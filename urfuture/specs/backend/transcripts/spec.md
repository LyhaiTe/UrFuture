# Transcript Specification

## Implemented endpoint

### `POST /api/transcript/upload`

Multipart fields:

- `userId`
- `yearLabel`
- `file`

Accepted MIME types are `application/pdf`, `image/png`, and `image/jpeg`. Files
larger than 10 MB are rejected. Successful responses return the created transcript
record after parsing. Storage failures and parsing failures return errors and mark
an existing row as failed where applicable.

## Implemented model

`Transcript` belongs to `User` and stores GCS metadata, parsed courses, raw text,
GPA, processing status, and upload/parse timestamps. The database migration is
`prisma/migrations/20260914160000_add_transcript_storage_metadata`.

## Current limitation

A transcript status/download endpoint is not currently implemented; the completed
API surface is the upload route above.
