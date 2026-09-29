'use client';

import {
  useRef,
  useState,
} from 'react';

const YEAR_OPTIONS = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

const MAX_FILE_SIZE_BYTES =
  10 * 1024 * 1024;

type UploadState =
  | 'idle'
  | 'uploading'
  | 'success'
  | 'error';

export default function TranscriptUpload({
  userId: _userId,
  onUploaded,
}: {
  userId: string;
  onUploaded: (transcript: {
    id: string;
    fileName: string;
    status: string;
  }) => void;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [yearLabel, setYearLabel] =
    useState(YEAR_OPTIONS[0]);

  const [uploadState, setUploadState] =
    useState<UploadState>('idle');

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const busy =
    uploadState === 'uploading';

  function resetMessages() {
    setError(null);
    setSuccess(null);

    if (uploadState !== 'uploading') {
      setUploadState('idle');
    }
  }

  function validateFile(
    selectedFile: File
  ): string | null {
    if (selectedFile.size === 0) {
      return 'The selected file is empty. Please choose a valid transcript.';
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE_BYTES
    ) {
      return 'Transcript files must be 10 MB or smaller.';
    }

    const extension =
      selectedFile.name
        .toLowerCase()
        .split('.')
        .pop();

    if (
      ![
        'pdf',
        'png',
        'jpg',
        'jpeg',
      ].includes(extension ?? '')
    ) {
      return 'Please select a PDF, PNG, JPG, or JPEG transcript.';
    }

    return null;
  }

  function selectFile(
    selectedFile: File | null
  ) {
    resetMessages();

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      setUploadState('error');

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      return;
    }

    setFile(selectedFile);
    setUploadState('idle');
  }

  function clearFile() {
    if (busy) {
      return;
    }

    setFile(null);
    setError(null);
    setSuccess(null);
    setUploadState('idle');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (!file || busy) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      setSuccess(null);
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();

      // userId is intentionally NOT sent.
      // The API derives student identity
      // from the authenticated session.
      form.append(
        'yearLabel',
        yearLabel
      );

      form.append('file', file);

      const response = await fetch(
        '/api/transcript/upload',
        {
          method: 'POST',
          body: form,
        }
      );

      let data: {
        error?: string;
        transcriptId?: string;
        transcript?: {
          id: string;
          fileName: string;
          status: string;
        };
      } = {};

      try {
        data =
          (await response.json()) as typeof data;
      } catch {
        // Keep the generic message below
        // if the server did not return JSON.
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Your session has expired. Please sign in again and retry.'
          );
        }

        if (response.status === 409) {
          throw new Error(
            data.error ||
              'This transcript has already been uploaded.'
          );
        }

        if (response.status === 422) {
          throw new Error(
            data.error ||
              'We could not reliably read this transcript. Please try a clearer file.'
          );
        }

        throw new Error(
          data.error ||
            'Transcript upload failed. Please try again.'
        );
      }

      if (!data.transcript) {
        throw new Error(
          'The upload completed but no transcript result was returned. Please retry.'
        );
      }

      onUploaded(data.transcript);

      setSuccess(
        `${file.name} was uploaded and parsed successfully for ${yearLabel}.`
      );

      setUploadState('success');
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Transcript upload failed. Please try again.'
      );

      // Keep the selected file so the
      // student can retry without choosing
      // it again.
      setUploadState('error');
    }
  }

  return (
    <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            Upload Coursework Transcripts
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            Upload transcripts from
            Year 1–4 to generate
            tailored diagnostic quizzes
            and verify your skills.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-[#34d399] px-2.5 py-0.5 rounded-full bg-[#064e3b] border border-[#0d6d53]/50 shrink-0">
          AI Auto-Extraction
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mt-2">
        {/* Academic term */}
        <div className="shrink-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Academic Term
          </label>

          <select
            value={yearLabel}
            disabled={busy}
            onChange={(event) => {
              setYearLabel(
                event.target.value
              );
              resetMessages();
            }}
            className="w-full rounded-xl bg-[#0e172a] border border-[#1b2b4c] text-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#00d2ff] outline-none disabled:opacity-50"
          >
            {YEAR_OPTIONS.map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              )
            )}
          </select>
        </div>

        {/* File input */}
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Transcript File (.pdf,
            .png, .jpg, .jpeg)
          </label>

          <div
            onDragEnter={(event) => {
              event.preventDefault();

              if (!busy) {
                setIsDragging(true);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);

              if (busy) {
                return;
              }

              selectFile(
                event.dataTransfer
                  .files?.[0] ?? null
              );
            }}
            className={`flex items-center justify-between gap-3 rounded-xl bg-[#0e172a] border border-dashed px-4 py-2 transition-colors ${
              isDragging
                ? 'border-[#00d2ff]'
                : 'border-[#1b2b4c] hover:border-[#00d2ff]'
            } ${
              busy
                ? 'opacity-60'
                : ''
            }`}
          >
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                inputRef.current?.click()
              }
              className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
            >
              <span className="block text-xs text-slate-300 truncate">
                {file
                  ? file.name
                  : isDragging
                    ? 'Drop transcript here'
                    : 'Select or drop transcript file…'}
              </span>

              {file && (
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{' '}
                  MB
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 shrink-0">
              {file && !busy && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Remove
                </button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  inputRef.current?.click()
                }
                className="text-[11px] font-semibold text-[#00d2ff] hover:underline disabled:cursor-not-allowed"
              >
                {file
                  ? 'Change'
                  : 'Browse'}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              disabled={busy}
              onChange={(event) =>
                selectFile(
                  event.target.files?.[0] ??
                    null
                )
              }
              className="hidden"
            />
          </div>
        </div>

        {/* Upload / retry */}
        <div className="shrink-0 flex items-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || busy}
            className="w-full sm:w-auto h-[38px] rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-40 disabled:cursor-not-allowed text-[#080d1a] font-bold text-xs px-5 shadow-md shadow-[#00d2ff]/20 transition-all flex items-center justify-center gap-1.5"
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                Uploading & parsing…
              </>
            ) : uploadState ===
                'error' &&
              file ? (
              'Retry Upload'
            ) : (
              'Upload & Parse'
            )}
          </button>
        </div>
      </div>

      {/* Upload progress */}
      {busy && (
        <div
          className="mt-3 p-2.5 rounded-lg bg-[#0e172a] border border-[#1b2b4c] text-slate-300 text-xs flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span className="w-3.5 h-3.5 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin shrink-0" />

          <span>
            Uploading and parsing your
            transcript. Please keep this
            page open.
          </span>
        </div>
      )}

      {/* Success */}
      {success &&
        uploadState ===
          'success' && (
          <div
            className="mt-3 p-2.5 rounded-lg bg-[#064e3b]/40 border border-[#0d6d53] text-[#34d399] text-xs flex items-center gap-2"
            role="status"
            aria-live="polite"
          >
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

      {/* Failure / recovery */}
      {error &&
        uploadState === 'error' && (
          <div
            className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <span>⚠</span>

              <div>
                <p className="font-semibold">
                  Upload unsuccessful
                </p>

                <p className="mt-0.5 text-red-400">
                  {error}
                </p>

                {file && (
                  <p className="mt-1.5 text-slate-400">
                    Your selected file has
                    been kept. You can
                    retry the upload
                    without selecting it
                    again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      <p className="mt-2 text-[10px] text-slate-500">
        Maximum file size: 10 MB. Supported
        formats: PDF, PNG, JPG, and JPEG.
      </p>
    </div>
  );
}