import type { GetBlobResult } from '@vercel/blob';
import { get, head, put } from '@vercel/blob';
import { Readable } from 'stream';

import { BadRequestError } from '@/errors';

import { config } from '../config';

const VERCEL_BLOB_HOST_SUFFIX = '.blob.vercel-storage.com';

/** Last path segment of a blob URL, for Content-Disposition / downloads. */
export function filenameHintFromBlobUrl(blobUrl: string): string {
  try {
    const parts = new URL(blobUrl).pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) {
      return 'download';
    }
    return last.replace(/[^\w.\-()+]/g, '_').slice(0, 200) || 'download';
  } catch {
    return 'download';
  }
}

export class StorageService {
  private readonly token?: string;

  constructor(token?: string) {
    // Vercel Blob requires BLOB_READ_WRITE_TOKEN environment variable
    this.token = token;
  }

  private getToken(): string {
    // Read token at runtime to ensure env vars are loaded
    return this.token || config.blobReadWriteToken || '';
  }

  private sanitizeBlobPath(pathname: string): string {
    const normalizedPath = pathname.replace(/\\/g, '/');
    const segments = normalizedPath.split('/').filter(Boolean);

    const sanitizedSegments = segments.map((segment) => {
      const withoutUnsafeChars = segment
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      return withoutUnsafeChars || 'file';
    });

    return sanitizedSegments.join('/');
  }

  /**
   * List all files in the storage (similar to getBucketContents)
   * Note: Vercel Blob doesn't have a direct list API, so this is a simplified version
   */
  async getBucketContents(): Promise<any[] | undefined> {
    try {
      // Vercel Blob doesn't support listing all blobs directly
      // You would need to maintain a database of uploaded files
      // For now, return undefined
      console.warn(
        'Vercel Blob does not support listing all files. Consider maintaining a database of uploaded files.',
      );
      return undefined;
    } catch (error) {
      console.error('Error listing files:', error);
      return undefined;
    }
  }

  /**
   * Returns true if the URL is a Vercel Blob object in this project (prevents open proxy / SSRF).
   */
  isTrustedVercelBlobUrl(urlString: string): boolean {
    try {
      const u = new URL(urlString);
      if (u.protocol !== 'https:') {
        return false;
      }
      return u.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
    } catch {
      return false;
    }
  }

  /**
   * Stream a private blob using the server token. Caller must enforce auth and pass only trusted URLs.
   */
  async getPrivateBlob(urlString: string): Promise<GetBlobResult | null> {
    if (!this.isTrustedVercelBlobUrl(urlString)) {
      throw new BadRequestError('Invalid blob URL');
    }
    const token = this.getToken();
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required to read blobs');
    }
    return get(urlString, { access: 'private', token });
  }

  /**
   * Upload a file to Vercel Blob Storage
   * @param filename - The path/key for the file (e.g., 'deals/dealId/timestamp-filename.pdf')
   * @param file - The file buffer to upload
   * @returns The blob URL (private store: use GET /storage/document with auth to read in browsers)
   */
  async uploadFile(
    filename: string,
    file: Buffer,
  ): Promise<string | undefined> {
    const token = this.getToken();
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for file uploads');
    }

    try {
      const safePath = this.sanitizeBlobPath(filename);

      // Vercel Blob expects either a ReadableStream, Blob, or string for put() body.
      // Convert Buffer to a ReadableStream
      const stream = Readable.from(file);
      const blob = await put(safePath, stream, {
        access: 'private',
        token: token,
      });

      return blob.url;
    } catch (error) {
      console.error('Error uploading file to Vercel Blob:', error);
      throw error;
    }
  }

  /**
   * Check if a file exists
   * @param filename - The path/key of the file
   * @returns True if file exists, false otherwise
   */
  async fileExists(filename: string): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      await head(filename, {
        token: token,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
