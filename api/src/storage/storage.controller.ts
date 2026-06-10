import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Readable } from 'stream';

import { DealsService } from '@/deals/deals.service';
import { AuthenticatedRestricted } from '@/decorators/authenticatedRestricted';
import { User } from '@/users/users.entities';

import { filenameHintFromBlobUrl, storageService } from './storage.service';

function escapeDispositionFilename(name: string): string {
  const ascii = name.replace(/[^\x20-\x7E]/g, '_').slice(0, 200);
  return ascii.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('document')
  @AuthenticatedRestricted()
  @ApiOperation({
    summary: 'Stream a Vercel Blob document (private store)',
    description:
      'Requires a Bearer JWT. Pass the blob URL returned by the API as the `url` query parameter. Only deal participants (or admins) may access objects under deals/ or payments/. Use download=1 to suggest a file download (Content-Disposition: attachment).',
  })
  async streamDocument(
    @Request() req: { user: User },
    @Query('url') blobUrl: string,
    @Res({ passthrough: false }) res: Response,
    @Query('download') download?: string,
  ): Promise<void> {
    if (!blobUrl || typeof blobUrl !== 'string') {
      res.status(400).json({ message: 'Missing url query parameter' });
      return;
    }

    await this.dealsService.assertUserMayReadBlobUrl(req.user, blobUrl);

    const result = await storageService.getPrivateBlob(blobUrl);

    if (!result || result.statusCode !== 200 || !result.stream) {
      res.status(404).end();
      return;
    }

    res.setHeader(
      'Content-Type',
      result.blob.contentType || 'application/octet-stream',
    );
    if (result.blob.size != null) {
      res.setHeader('Content-Length', String(result.blob.size));
    }
    res.setHeader('Cache-Control', 'private, no-store');

    const wantsAttachment =
      download === '1' || download === 'true' || download === 'yes';
    if (wantsAttachment) {
      const hint = filenameHintFromBlobUrl(blobUrl);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${escapeDispositionFilename(hint)}"`,
      );
    }

    const nodeStream = Readable.fromWeb(
      result.stream as import('stream/web').ReadableStream<Uint8Array>,
    );
    nodeStream.pipe(res);
  }
}
