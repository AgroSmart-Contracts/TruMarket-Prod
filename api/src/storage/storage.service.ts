import { put, head } from '@vercel/blob';

import { config } from '../config';

export class StorageService {
  private readonly token: string;

  constructor(token?: string) {
    // Vercel Blob requires BLOB_READ_WRITE_TOKEN environment variable
    this.token = token || process.env.BLOB_READ_WRITE_TOKEN || '';
    if (!this.token) {
      console.warn('BLOB_READ_WRITE_TOKEN not set. File uploads will fail.');
    }
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
      console.warn('Vercel Blob does not support listing all files. Consider maintaining a database of uploaded files.');
      return undefined;
    } catch (error) {
      console.error('Error listing files:', error);
      return undefined;
    }
  }

  /**
   * Upload a file to Vercel Blob Storage
   * @param filename - The path/key for the file (e.g., 'deals/dealId/timestamp-filename.pdf')
   * @param file - The file buffer to upload
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    filename: string,
    file: Buffer,
  ): Promise<string | undefined> {
    if (!this.token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for file uploads');
    }

    try {
      const blob = await put(filename, file, {
        access: 'public', // Make files publicly accessible
        token: this.token,
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
    if (!this.token) {
      return false;
    }

    try {
      await head(filename, {
        token: this.token,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

