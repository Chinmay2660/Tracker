import { toast } from 'sonner';
import { getApiBaseUrl } from './apiBase';

function resumeFileUrl(resumeId: string): string {
  return `${getApiBaseUrl()}/resumes/${resumeId}/file`;
}

export class ResumeFileError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'SIGN_IN_REQUIRED'
      | 'FETCH_FAILED'
      | 'UNAUTHORIZED'
      | 'CORS_OR_NETWORK',
    public readonly httpStatus?: number
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

  let res: Response;
  try {
    res = await fetch(resumeFileUrl(resumeId), {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new ResumeFileError('Could not reach the server.', 'CORS_OR_NETWORK');
    }
    throw e;
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new ResumeFileError('Session expired', 'UNAUTHORIZED');
  }

  if (!res.ok) {
    throw new ResumeFileError(`HTTP ${res.status}`, 'FETCH_FAILED', res.status);
  }

  return res.blob();
}

export function showResumeFetchErrorToast(err: unknown, context: 'view' | 'download'): void {
  const action = context === 'view' ? 'load' : 'download';

  if (err instanceof ResumeFileError && err.code === 'UNAUTHORIZED') return;
  if (err instanceof ResumeFileError && err.code === 'SIGN_IN_REQUIRED') {
    toast.error('Sign in required', {
      description: `Please sign in to ${action} your resume.`,
    });
    return;
  }

  const description =
    err instanceof ResumeFileError ? err.message : 'Something went wrong. Try again.';
  toast.error(`Could not ${action} resume`, { description });
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
    showResumeFetchErrorToast(err, 'download');
  }
}

/**
 * Opens a blob URL in a new tab (PDF viewer, download, or system handler). Returns false if pop-ups are blocked.
 */
export function openResumeBlobUrlInNewTab(blobUrl: string): boolean {
  const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
  return win != null;
}
