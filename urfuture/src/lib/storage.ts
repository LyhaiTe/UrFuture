import { Storage } from '@google-cloud/storage';

export async function uploadTranscript(objectKey: string, data: Buffer, contentType: string) {
  const bucketName = process.env.GCS_TRANSCRIPT_BUCKET;
  
  if (!bucketName) {
    return `skipped://${objectKey}`;
  }

  const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });
  const file = storage.bucket(bucketName).file(objectKey);
  
  await file.save(data, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: 'private, max-age=0, no-cache',
    },
  });

  return `gs://${bucketName}/${objectKey}`;
}