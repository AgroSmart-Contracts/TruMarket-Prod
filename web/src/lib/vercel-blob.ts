import axiosInstance from "src/config/axios";

/** Hostnames used for Vercel Blob object URLs (private blobs are still served from this host). */
export function isVercelBlobObjectUrl(url: string | undefined | null): boolean {
  if (!url) {
    return false;
  }
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

function extensionFromPathname(blobUrl: string): string {
  try {
    const last = new URL(blobUrl).pathname.split("/").filter(Boolean).pop() || "";
    if (!last.includes(".")) {
      return "";
    }
    return last.split(".").pop() || "";
  } catch {
    return "";
  }
}

function resolveDownloadFilename(blobUrl: string, description: string): string {
  let filename = "";
  try {
    filename = new URL(blobUrl).pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    filename = "";
  }
  if (!filename) {
    const base = description?.trim() || "document";
    const ext = extensionFromPathname(blobUrl);
    filename = ext ? `${base}.${ext}` : base;
  }
  return filename;
}

/**
 * Trigger a file save from a Blob. Call this from a click handler so the browser allows the download.
 */
function triggerBrowserFileDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
}

/**
 * Download via authenticated API for private Vercel Blob; otherwise open in a new tab.
 * Must be started from a user gesture (e.g. button click); otherwise the browser may block the save.
 */
export async function downloadBlobOrOpenInNewTab(url: string, description: string): Promise<void> {
  if (!isVercelBlobObjectUrl(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const response = await axiosInstance.get("/storage/document", {
    params: { url, download: "1" },
    responseType: "blob",
  });
  const filename = resolveDownloadFilename(url, description);
  const headerCt = response.headers["content-type"];
  const mime =
    (typeof headerCt === "string" && headerCt.split(";")[0].trim()) ||
    (response.data as Blob).type ||
    "application/octet-stream";
  const raw = response.data as Blob;
  const blob =
    raw instanceof Blob && raw.type ? raw : new Blob([raw], { type: mime });
  triggerBrowserFileDownload(blob, filename);
}

/**
 * Fetches a private Vercel Blob via the API (JWT from axios defaults) and returns an object URL.
 * Caller must revoke the URL when done.
 */
export async function fetchVercelBlobObjectUrl(blobUrl: string): Promise<string> {
  const response = await axiosInstance.get("/storage/document", {
    params: { url: blobUrl },
    responseType: "blob",
  });
  const raw = response.data as Blob;
  const headerCt = response.headers["content-type"];
  const contentType =
    (typeof headerCt === "string" && headerCt.split(";")[0].trim()) ||
    raw.type ||
    "application/octet-stream";
  const blob =
    raw.type && raw.type === contentType ? raw : new Blob([raw], { type: contentType });
  return URL.createObjectURL(blob);
}
