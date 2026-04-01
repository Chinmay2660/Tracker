const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Opens a resume file URL in a new browser context (new tab / external browser).
 *
 * Important for **mobile and “Add to Home Screen” / PWA standalone**:
 * Opening must happen **synchronously** in the same turn as the user’s tap. Any `await`
 * before this (e.g. fetch) consumes “user activation”, and Safari / standalone WebViews
 * will block pop-ups and synthetic navigations—so we do **not** fetch+blob here.
 *
 * Files are served as static uploads on the API (`/uploads/...`); a direct absolute URL
 * is enough for the OS/browser to open PDF or download DOC.
 */
function openUrlInNewTabOnly(url: string): void {
  // Single path: <a target="_blank"> works best for iOS PWA / “Add to Home Screen” (standalone).
  // Do not call window.open() as well — that would open a second tab.
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function openResumeFile(fileUrl: string): void {
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE.replace(/\/$/, '')}${path}`;
  openUrlInNewTabOnly(fullUrl);
}
