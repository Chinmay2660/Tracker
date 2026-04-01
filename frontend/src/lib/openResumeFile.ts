const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Opens a resume file (PDF/DOC) in a new tab only (never navigates the current tab).
 * Uses fetch → blob URL so mobile browsers can open the file reliably.
 */
function openUrlInNewTabOnly(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) return;
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function openResumeFile(fileUrl: string): Promise<void> {
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE.replace(/\/$/, '')}${path}`;

  // No Authorization header: uploads are served as static files (simple GET avoids CORS preflight).
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    openUrlInNewTabOnly(blobUrl);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
  } catch {
    openUrlInNewTabOnly(fullUrl);
  }
}
