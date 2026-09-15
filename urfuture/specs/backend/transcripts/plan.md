# Transcript Plan

## Implemented flow
1. `src/components/TranscriptUpload.tsx` submits multipart form data.
2. `POST /api/transcript/upload` validates the student ID, file type, and size.
3. PDF, PNG, and JPEG bytes are uploaded through `src/lib/storage.ts` to GCS.
4. PostgreSQL stores the `Transcript` metadata and `gs://` object URL.
5. Claude extracts course data and GPA-related values.
6. The row is marked `PARSED` or `FAILED`.

## Storage boundary
The configured private GCS bucket stores document bytes. PostgreSQL stores file
name, URL, object key, MIME type, size, parsed text, parsed courses, GPA, status,
and timestamps.
