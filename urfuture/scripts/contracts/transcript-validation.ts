import assert from 'node:assert/strict';
import { prisma } from '../../src/lib/db';
import {
  createStudentSessionToken,
  STUDENT_SESSION_COOKIE,
} from '../../src/lib/studentSession';

const BASE_URL =
  process.env.CONTRACT_TEST_BASE_URL ??
  'http://localhost:3000';

const suffix = Date.now().toString();

async function upload(
  cookie: string,
  file: File
) {
  const form = new FormData();
  form.append('yearLabel', 'Year 1');
  form.append('file', file);

  return fetch(
    `${BASE_URL}/api/transcript/upload`,
    {
      method: 'POST',
      headers: {
        Cookie: cookie,
      },
      body: form,
    }
  );
}

async function main() {
  console.log(
    'Starting transcript validation contract tests...'
  );

  const student =
    await prisma.user.create({
      data: {
        email:
          `transcript-contract-${suffix}@example.com`,
        name:
          'Transcript Contract Student',
        role: 'STUDENT',
      },
    });

  const cookie =
    `${STUDENT_SESSION_COOKIE}=` +
    createStudentSessionToken(
      student.id
    );

  try {
    // ----------------------------------------
    // 1. Empty file
    // ----------------------------------------

    const emptyFile = new File(
      [],
      'empty.pdf',
      {
        type: 'application/pdf',
      }
    );

    const emptyResponse =
      await upload(
        cookie,
        emptyFile
      );

    assert.equal(
      emptyResponse.status,
      400,
      'Empty transcript must be rejected'
    );

    console.log(
      '✓ Empty file rejected'
    );

    // ----------------------------------------
    // 2. Fake PDF
    // ----------------------------------------

    const fakePdf = new File(
      [
        Buffer.from(
          'This is not actually a PDF.'
        ),
      ],
      'fake.pdf',
      {
        type: 'application/pdf',
      }
    );

    const fakeResponse =
      await upload(
        cookie,
        fakePdf
      );

    assert.equal(
      fakeResponse.status,
      400,
      'Fake PDF must be rejected'
    );

    console.log(
      '✓ Fake PDF rejected'
    );

    // ----------------------------------------
    // 3. MIME/content mismatch
    // ----------------------------------------

    const pngBytes = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
      0x00,
      0x00,
      0x00,
      0x00,
    ]);

    const mismatchFile =
      new File(
        [pngBytes],
        'mismatch.png',
        {
          type: 'image/jpeg',
        }
      );

    const mismatchResponse =
      await upload(
        cookie,
        mismatchFile
      );

    assert.equal(
      mismatchResponse.status,
      400,
      'MIME/content mismatch must be rejected'
    );

    console.log(
      '✓ MIME/content mismatch rejected'
    );

    // ----------------------------------------
    // 4. Extension/content mismatch
    // ----------------------------------------

    const extensionMismatch =
      new File(
        [pngBytes],
        'actually-a-png.jpg',
        {
          type: 'image/png',
        }
      );

    const extensionResponse =
      await upload(
        cookie,
        extensionMismatch
      );

    assert.equal(
      extensionResponse.status,
      400,
      'Extension/content mismatch must be rejected'
    );

    console.log(
      '✓ Extension/content mismatch rejected'
    );

    // ----------------------------------------
    // 5. Duplicate hash rule
    //
    // Seed a transcript directly with the
    // same SHA-256 hash, then verify the API
    // rejects those bytes before storage or
    // parsing occurs.
    // ----------------------------------------

    const duplicateBytes =
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        0x01,
        0x02,
        0x03,
        0x04,
      ]);

    const {
      createHash,
    } = await import(
      'node:crypto'
    );

    const duplicateHash =
      createHash('sha256')
        .update(duplicateBytes)
        .digest('hex');

    await prisma.transcript.create({
      data: {
        userId: student.id,
        fileName:
          'existing.png',
        fileUrl:
          'contract-test://existing',
        storageObjectKey:
          `contract/${suffix}/existing.png`,
        fileHash:
          duplicateHash,
        mimeType:
          'image/png',
        fileSizeBytes:
          duplicateBytes.length,
        yearLabel:
          'Year 1',
        status:
          'PARSED',
        parserVersion:
          'transcript-v1',
        parserStatus:
          'PARSED',
        parsedCourses: [],
        parsedAt:
          new Date(),
      },
    });

    const duplicateFile =
      new File(
        [duplicateBytes],
        'duplicate.png',
        {
          type: 'image/png',
        }
      );

    const duplicateResponse =
      await upload(
        cookie,
        duplicateFile
      );

    assert.equal(
      duplicateResponse.status,
      409,
      'Duplicate transcript must be rejected'
    );

    const duplicateBody =
      (await duplicateResponse.json()) as {
        error?: string;
        transcriptId?: string;
      };

    assert.ok(
      duplicateBody.transcriptId,
      'Duplicate response should identify the existing transcript'
    );

    console.log(
      '✓ Duplicate transcript rejected'
    );

    // ----------------------------------------
    // 6. Invalid uploads must not create
    // accidental transcript records.
    //
    // Only our manually seeded duplicate
    // transcript should exist.
    // ----------------------------------------

    const transcriptCount =
      await prisma.transcript.count({
        where: {
          userId: student.id,
        },
      });

    assert.equal(
      transcriptCount,
      1,
      'Rejected validation requests must not create transcript records'
    );

    console.log(
      '✓ Rejected files create no extra transcript records'
    );

    console.log('');
    console.log(
      'All Task 4 transcript validation contract tests passed.'
    );
  } finally {
    await prisma.user.delete({
      where: {
        id: student.id,
      },
    });

    await prisma.$disconnect();
  }
}

main().catch(
  async (error) => {
    console.error('');
    console.error(
      'Transcript validation contract test failed:'
    );
    console.error(error);

    await prisma.$disconnect();
    process.exit(1);
  }
);