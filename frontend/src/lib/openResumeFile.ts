import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function resumeFileUrl(resumeId: string): string {
  const apiBase = API_BASE.replace(/\/$/, '');
  return `${apiBase}/resumes/${resumeId}/file`;
}

export class ResumeFileError extends Error {
  constructor(
    message: string,
    public readonly code: 'SIGN_IN_REQUIRED' | 'FETCH_FAILED'
  ) {
    super(message);
    this.name = 'ResumeFileError';
  }
}

/**
 * Fetches the resume file from `GET /resumes/:id/file` with Bearer auth.
 */
export async function fetchResumeBlob(resumeId: string): Promise<Blob> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new ResumeFileError('Sign in required', 'SIGN_IN_REQUIRED');
  }

  const res = await fetch(resumeFileUrl(resumeId), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new ResumeFileError(`HTTP ${res.status}`, 'FETCH_FAILED');
  }

  return res.blob();
}

/** Safe download filename from display name + stored path extension. */
export function buildResumeDownloadFilename(displayName: string, fileUrl: string): string {
  const ext = fileUrl.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? 'pdf';
  const base = displayName.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'resume';
  return `${base}.${ext}`;
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  a.click();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/**
 * Downloads a resume (fetches from API, then saves with a sensible filename).
 */
export async function downloadResumeFile(
  resumeId: string,
  displayName: string,
  fileUrl: string
): Promise<void> {
  try {
    const blob = await fetchResumeBlob(resumeId);
    const fileName = buildResumeDownloadFilename(displayName, fileUrl);
    triggerBlobDownload(blob, fileName);
  } catch (err) {
    if (err instanceof ResumeFileError && err.code === 'SIGN_IN_REQUIRED') {
      toast.error('Sign in required', { description: 'Please sign in to download your resume.' });
      return;
    }
    toast.error('Could not download resume', {
      description:
        'Check your connection. Ensure VITE_API_URL points to your backend, not the Vercel app URL.',
    });
  }
}

/** PDFs can be shown in an iframe; Word docs usually cannot. */
export function canPreviewResumeInBrowser(blob: Blob, fileUrl: string): boolean {
  if (blob.type === 'application/pdf') return true;
  return fileUrl.toLowerCase().endsWith('.pdf');
}
